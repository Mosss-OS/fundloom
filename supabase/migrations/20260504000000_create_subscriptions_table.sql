-- Create subscriptions table for streaming/recurring donations

CREATE TYPE public.subscription_interval AS ENUM ('daily', 'weekly', 'monthly', 'yearly');
CREATE TYPE public.subscription_status AS ENUM ('active', 'paused', 'cancelled', 'completed');

CREATE TABLE public.subscriptions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    donor_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    amount NUMERIC(20, 2) NOT NULL CHECK (amount > 0),
    interval public.subscription_interval NOT NULL DEFAULT 'monthly',
    start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    end_date TIMESTAMPTZ NULL,
    status public.subscription_status NOT NULL DEFAULT 'active',
    payment_method public.payment_method NOT NULL DEFAULT 'crypto',
    last_charged_at TIMESTAMPTZ NULL,
    next_charge_at TIMESTAMPTZ NULL,
    tx_hash TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_subscriptions_campaign ON public.subscriptions(campaign_id);
CREATE INDEX idx_subscriptions_donor ON public.subscriptions(donor_user_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- For MVP, allow public reads (transparency)
CREATE POLICY "Subscriptions are viewable by everyone"
  ON public.subscriptions FOR SELECT USING (true);

-- Writes go through edge functions using service role (anon key cannot write)
-- We'll create edge functions for subscription management later.

-- Helper function to update the updated_at column
-- (Assuming we have the trigger function already from earlier migrations)
-- If not, we would need to add it, but we assume it exists.

-- Create trigger to update updated_at column
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'subscriptions_updated_at') THEN
        CREATE TRIGGER subscriptions_updated_at
        BEFORE UPDATE ON public.subscriptions
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END
$$;