
-- 1. Add category + verification to campaigns
DO $$ BEGIN
  CREATE TYPE public.campaign_category AS ENUM (
    'art','tech','community','education','health','environment','music','food','gaming','other'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS category public.campaign_category NOT NULL DEFAULT 'other',
  ADD COLUMN IF NOT EXISTS is_verified boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_campaigns_category ON public.campaigns(category);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_deadline ON public.campaigns(deadline);

-- 2. Campaign updates
CREATE TABLE IF NOT EXISTS public.campaign_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.campaign_updates ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_campaign_updates_campaign ON public.campaign_updates(campaign_id, created_at DESC);

DROP POLICY IF EXISTS "Updates viewable by everyone" ON public.campaign_updates;
CREATE POLICY "Updates viewable by everyone"
  ON public.campaign_updates FOR SELECT USING (true);

-- writes go through server functions (service role bypasses RLS), no public write policies

CREATE TRIGGER trg_campaign_updates_updated
  BEFORE UPDATE ON public.campaign_updates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Campaign comments
CREATE TABLE IF NOT EXISTS public.campaign_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.campaign_comments ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_campaign_comments_campaign ON public.campaign_comments(campaign_id, created_at DESC);

DROP POLICY IF EXISTS "Comments viewable by everyone" ON public.campaign_comments;
CREATE POLICY "Comments viewable by everyone"
  ON public.campaign_comments FOR SELECT USING (true);

-- 4. Refunds
CREATE TABLE IF NOT EXISTS public.refunds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  donor_user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  donor_wallet text NOT NULL,
  amount numeric NOT NULL,
  tx_hash text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_refunds_campaign ON public.refunds(campaign_id);
CREATE INDEX IF NOT EXISTS idx_refunds_donor ON public.refunds(donor_user_id);

DROP POLICY IF EXISTS "Donors view their refunds" ON public.refunds;
CREATE POLICY "Donors view their refunds"
  ON public.refunds FOR SELECT
  USING (auth.uid() = donor_user_id OR public.has_role(auth.uid(), 'admin'::public.app_role));

-- 5. Storage bucket for campaign covers
INSERT INTO storage.buckets (id, name, public)
VALUES ('campaign-covers', 'campaign-covers', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Campaign covers are publicly readable" ON storage.objects;
CREATE POLICY "Campaign covers are publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'campaign-covers');

-- 6. Helper: mark expired & unfunded campaigns as failed
CREATE OR REPLACE FUNCTION public.mark_expired_campaigns()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  affected integer;
BEGIN
  UPDATE public.campaigns
     SET status = 'failed'
   WHERE status = 'active'
     AND deadline < now()
     AND amount_raised < goal_amount;
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.mark_expired_campaigns() FROM public, anon, authenticated;
