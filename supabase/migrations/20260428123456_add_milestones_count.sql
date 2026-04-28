-- Add milestones_count column to campaigns table
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS milestones_count INTEGER DEFAULT 0;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_campaigns_milestones_count ON campaigns(milestones_count);

-- Update existing campaigns to have milestones_count from on-chain data
-- This would need to be populated by a script that reads from the smart contract
