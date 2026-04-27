-- Storage bucket for partner logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('partner-logos', 'partner-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Public can read all partner logos
CREATE POLICY "Partner logos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'partner-logos');

-- Server (service role) bypasses RLS, so no insert/update/delete policies are needed for storage.
-- Uploads happen via a server function using the admin client.

-- Helper: check admin role by Fundloom user id (since auth is via Privy, not Supabase Auth)
CREATE OR REPLACE FUNCTION public.is_admin_user(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'admin'::public.app_role
  )
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin_user(uuid) FROM PUBLIC, anon, authenticated;