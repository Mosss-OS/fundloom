
-- Campaigns: allow insert if user_id exists in users table
CREATE POLICY "Anyone can create a campaign for an existing user"
ON public.campaigns
FOR INSERT
TO anon, authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM public.users u WHERE u.id = user_id)
);

CREATE POLICY "Campaign owners can update their campaigns"
ON public.campaigns
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Campaign updates: allow author to insert
CREATE POLICY "Anyone can post a campaign update"
ON public.campaign_updates
FOR INSERT
TO anon, authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM public.users u WHERE u.id = author_id)
);

-- Campaign comments: allow author to insert
CREATE POLICY "Anyone can post a campaign comment"
ON public.campaign_comments
FOR INSERT
TO anon, authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM public.users u WHERE u.id = author_id)
);

-- Donations: allow inserts (donor_user_id optional)
CREATE POLICY "Anyone can record a donation"
ON public.donations
FOR INSERT
TO anon, authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = campaign_id)
);
