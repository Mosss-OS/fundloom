-- App roles enum + user_roles table (security best practice: roles in separate table)
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Partners / sponsors table for the landing page marquee
CREATE TABLE public.partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  url text,
  logo_url text,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_partners_active_order ON public.partners (is_active, display_order);

ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

-- Anyone can view active partners (used on the public landing page)
CREATE POLICY "Active partners are viewable by everyone"
  ON public.partners FOR SELECT
  USING (is_active = true);

-- Admins can view every partner (including inactive ones) for management
CREATE POLICY "Admins can view all partners"
  ON public.partners FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert partners"
  ON public.partners FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update partners"
  ON public.partners FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete partners"
  ON public.partners FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- updated_at trigger using the existing helper function
CREATE TRIGGER update_partners_updated_at
  BEFORE UPDATE ON public.partners
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Seed initial partners so the marquee isn't empty on first load
INSERT INTO public.partners (name, url, display_order) VALUES
  ('Base',      'https://base.org',       10),
  ('USDC',      'https://www.circle.com/usdc', 20),
  ('Privy',     'https://www.privy.io',   30),
  ('Coinbase',  'https://www.coinbase.com', 40),
  ('Optimism',  'https://www.optimism.io', 50),
  ('Ethereum',  'https://ethereum.org',   60),
  ('Stripe',    'https://stripe.com',     70),
  ('Plaid',     'https://plaid.com',      80);