-- Database indexing for performance optimization
-- Issue #379: Database indexing

-- Campaigns table indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON public.campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_category ON public.campaigns(category);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON public.campaigns(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_campaigns_goal_amount ON public.campaigns(goal_amount);
CREATE INDEX IF NOT EXISTS idx_campaigns_amount_raised ON public.campaigns(amount_raised DESC);

-- Composite index for common query (status + created_at)
CREATE INDEX IF NOT EXISTS idx_campaigns_status_created 
  ON public.campaigns(status, created_at DESC);

-- Composite index for category + status queries
CREATE INDEX IF NOT EXISTS idx_campaigns_category_status 
  ON public.campaigns(category, status);

-- Donations table indexes
CREATE INDEX IF NOT EXISTS idx_donations_campaign_id ON public.donations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_donations_donor_user_id ON public.donations(donor_user_id);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON public.donations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_donations_amount ON public.donations(amount DESC);

-- Composite index for campaign donations
CREATE INDEX IF NOT EXISTS idx_donations_campaign_created 
  ON public.donations(campaign_id, created_at DESC);

-- Campaign updates indexes
CREATE INDEX IF NOT EXISTS idx_campaign_updates_campaign_id ON public.campaign_updates(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_updates_created_at ON public.campaign_updates(created_at DESC);

-- Campaign comments indexes
CREATE INDEX IF NOT EXISTS idx_campaign_comments_campaign_id ON public.campaign_comments(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_comments_author_id ON public.campaign_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_campaign_comments_created_at ON public.campaign_comments(created_at DESC);

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON public.users(wallet_address);

-- API keys indexes (already created in migration, but ensuring)
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON public.api_keys(key_hash);

-- Subscriptions indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_campaign_id ON public.subscriptions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_billing_date ON public.subscriptions(next_billing_date);

-- Milestones indexes
CREATE INDEX IF NOT EXISTS idx_milestones_campaign_id ON public.milestones(campaign_id);
CREATE INDEX IF NOT EXISTS idx_milestones_created_at ON public.milestones(created_at DESC);

-- Disputes indexes
CREATE INDEX IF NOT EXISTS idx_disputes_campaign_id ON public.disputes(campaign_id);
CREATE INDEX IF NOT EXISTS idx_disputes_raiser_user_id ON public.disputes(raiser_user_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON public.disputes(status);

-- Partial indexes for active records (smaller, faster)
CREATE INDEX IF NOT EXISTS idx_campaigns_active 
  ON public.campaigns(created_at DESC) 
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_donations_recent 
  ON public.donations(campaign_id, created_at DESC) 
  WHERE created_at > now() - interval '30 days';

-- Analyze tables to update statistics
ANALYZE public.campaigns;
ANALYZE public.donations;
ANALYZE public.campaign_updates;
ANALYZE public.campaign_comments;
ANALYZE public.users;
ANALYZE public.subscriptions;
