ALTER TABLE public.campaigns
ADD COLUMN IF NOT EXISTS milestones_count INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_campaigns_milestones_count
ON public.campaigns(milestones_count);