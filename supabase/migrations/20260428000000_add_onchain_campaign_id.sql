-- Add on_chain_campaign_id to link Supabase campaigns to smart contract campaigns
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS on_chain_campaign_id INTEGER;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_campaigns_onchain_id ON campaigns(on_chain_campaign_id);

-- Add contract address column for reference
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS contract_address TEXT;
