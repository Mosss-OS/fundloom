-- Enums
CREATE TYPE public.campaign_status AS ENUM ('active', 'completed', 'cancelled');
CREATE TYPE public.payout_pref AS ENUM ('crypto', 'fiat');
CREATE TYPE public.payment_method AS ENUM ('crypto', 'fiat');
CREATE TYPE public.tx_type AS ENUM ('donation', 'withdrawal');
CREATE TYPE public.tx_status AS ENUM ('pending', 'confirmed', 'failed');

-- Users table (Privy-backed; auth.uid() not used since Privy handles auth)
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  privy_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  wallet_address TEXT,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  goal_amount NUMERIC(20, 2) NOT NULL CHECK (goal_amount > 0),
  amount_raised NUMERIC(20, 2) NOT NULL DEFAULT 0,
  deadline TIMESTAMPTZ NOT NULL,
  status public.campaign_status NOT NULL DEFAULT 'active',
  cover_image_url TEXT,
  payout_preference public.payout_pref NOT NULL DEFAULT 'crypto',
  contract_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_campaigns_user ON public.campaigns(user_id);
CREATE INDEX idx_campaigns_status ON public.campaigns(status);

CREATE TABLE public.donations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  donor_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  donor_wallet TEXT NOT NULL,
  amount NUMERIC(20, 2) NOT NULL CHECK (amount > 0),
  tx_hash TEXT,
  payment_method public.payment_method NOT NULL DEFAULT 'crypto',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_donations_campaign ON public.donations(campaign_id);
CREATE INDEX idx_donations_donor ON public.donations(donor_user_id);

CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  type public.tx_type NOT NULL,
  amount NUMERIC(20, 2) NOT NULL,
  status public.tx_status NOT NULL DEFAULT 'pending',
  tx_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_transactions_user ON public.transactions(user_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_campaigns_updated_at BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Since Privy is the auth source (not Supabase auth), we use permissive
-- read policies and rely on the edge function layer + the anon key for
-- writes. Edge functions will use the service role to enforce ownership.
-- For MVP we allow public reads on campaigns/donations/users (public profile).

-- USERS: public read of basic info (email exposed because user is creator)
CREATE POLICY "Users are viewable by everyone"
  ON public.users FOR SELECT USING (true);

-- CAMPAIGNS: public read
CREATE POLICY "Campaigns are viewable by everyone"
  ON public.campaigns FOR SELECT USING (true);

-- DONATIONS: public read (transparency)
CREATE POLICY "Donations are viewable by everyone"
  ON public.donations FOR SELECT USING (true);

-- TRANSACTIONS: public read for now (transparency); will be locked down
-- once we route writes through edge functions with service role.
CREATE POLICY "Transactions are viewable by everyone"
  ON public.transactions FOR SELECT USING (true);

-- Writes are intentionally NOT exposed via anon key. All inserts/updates
-- go through edge functions using SUPABASE_SERVICE_ROLE_KEY which bypasses RLS.

-- Helper function: increment amount_raised atomically
CREATE OR REPLACE FUNCTION public.increment_campaign_raised(_campaign_id UUID, _amount NUMERIC)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.campaigns
  SET amount_raised = amount_raised + _amount
  WHERE id = _campaign_id;
END;
$$;