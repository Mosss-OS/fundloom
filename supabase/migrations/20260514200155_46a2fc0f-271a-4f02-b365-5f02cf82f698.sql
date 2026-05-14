-- Add confirmation tracking to donations for on-chain webhook flow
ALTER TABLE public.donations
  ADD COLUMN IF NOT EXISTS confirmed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS confirmed_at timestamptz,
  ADD COLUMN IF NOT EXISTS block_number bigint,
  ADD COLUMN IF NOT EXISTS chain_id integer;

-- Existing fiat/legacy rows are treated as confirmed so historical totals stay consistent
UPDATE public.donations SET confirmed = true, confirmed_at = COALESCE(confirmed_at, created_at)
  WHERE confirmed = false AND (payment_method = 'fiat' OR created_at < now());

-- Idempotency: a given on-chain tx hash can only credit once
CREATE UNIQUE INDEX IF NOT EXISTS donations_tx_hash_crypto_unique
  ON public.donations (lower(tx_hash))
  WHERE payment_method = 'crypto' AND tx_hash IS NOT NULL;

-- SECURITY DEFINER function that confirms a crypto donation and credits the campaign atomically.
-- Called only by the webhook (service role) – not exposed to anon/authenticated.
CREATE OR REPLACE FUNCTION public.confirm_crypto_donation(
  _campaign_id uuid,
  _donor_wallet text,
  _amount numeric,
  _tx_hash text,
  _block_number bigint,
  _chain_id integer
) RETURNS public.donations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing public.donations;
  inserted public.donations;
BEGIN
  IF _tx_hash IS NULL OR length(trim(_tx_hash)) = 0 THEN
    RAISE EXCEPTION 'tx_hash is required';
  END IF;
  IF _amount <= 0 THEN
    RAISE EXCEPTION 'amount must be positive';
  END IF;

  SELECT * INTO existing FROM public.donations
   WHERE payment_method = 'crypto' AND lower(tx_hash) = lower(_tx_hash)
   LIMIT 1;

  IF FOUND THEN
    -- Already credited – idempotent no-op
    IF existing.confirmed THEN
      RETURN existing;
    END IF;
    UPDATE public.donations
       SET confirmed = true,
           confirmed_at = now(),
           block_number = COALESCE(_block_number, block_number),
           chain_id = COALESCE(_chain_id, chain_id),
           amount = _amount
     WHERE id = existing.id
     RETURNING * INTO inserted;
  ELSE
    INSERT INTO public.donations (
      campaign_id, donor_wallet, amount, payment_method, tx_hash,
      confirmed, confirmed_at, block_number, chain_id
    ) VALUES (
      _campaign_id, _donor_wallet, _amount, 'crypto', _tx_hash,
      true, now(), _block_number, _chain_id
    ) RETURNING * INTO inserted;
  END IF;

  -- Credit the campaign exactly once
  UPDATE public.campaigns
     SET amount_raised = amount_raised + _amount
   WHERE id = _campaign_id;

  RETURN inserted;
END;
$$;

REVOKE ALL ON FUNCTION public.confirm_crypto_donation(uuid,text,numeric,text,bigint,integer) FROM PUBLIC, anon, authenticated;