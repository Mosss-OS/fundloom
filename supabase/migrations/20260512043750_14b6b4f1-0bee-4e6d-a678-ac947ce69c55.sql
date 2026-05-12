CREATE OR REPLACE FUNCTION public.sync_privy_user(
  _privy_id text,
  _email text,
  _wallet_address text DEFAULT NULL,
  _display_name text DEFAULT NULL
)
RETURNS public.users
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  synced_user public.users;
BEGIN
  IF _privy_id IS NULL OR length(trim(_privy_id)) = 0 THEN
    RAISE EXCEPTION 'privy_id is required';
  END IF;

  IF _email IS NULL OR length(trim(_email)) = 0 THEN
    RAISE EXCEPTION 'email is required';
  END IF;

  INSERT INTO public.users (privy_id, email, wallet_address, display_name)
  VALUES (
    trim(_privy_id),
    lower(trim(_email)),
    NULLIF(trim(COALESCE(_wallet_address, '')), ''),
    NULLIF(trim(COALESCE(_display_name, '')), '')
  )
  ON CONFLICT (privy_id) DO UPDATE SET
    email = EXCLUDED.email,
    wallet_address = COALESCE(EXCLUDED.wallet_address, public.users.wallet_address),
    display_name = COALESCE(EXCLUDED.display_name, public.users.display_name),
    updated_at = now()
  RETURNING * INTO synced_user;

  RETURN synced_user;
END;
$$;

REVOKE ALL ON FUNCTION public.sync_privy_user(text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.sync_privy_user(text, text, text, text) TO anon, authenticated;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_user(uuid) TO anon, authenticated;