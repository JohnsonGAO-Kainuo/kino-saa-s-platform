-- Create user_assets table for managing multiple logos, signatures, and stamps
CREATE TABLE IF NOT EXISTS user_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('logo', 'signature', 'stamp')),
  asset_url TEXT NOT NULL,
  asset_name TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_assets_user_id ON user_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_user_assets_type ON user_assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_user_assets_default ON user_assets(is_default) WHERE is_default = true;

-- Enable RLS
ALTER TABLE user_assets ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own assets"
  ON user_assets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assets"
  ON user_assets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assets"
  ON user_assets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own assets"
  ON user_assets FOR DELETE
  USING (auth.uid() = user_id);

-- Add comments
COMMENT ON TABLE user_assets IS 'Stores multiple logos, signatures, and stamps for each user';
COMMENT ON COLUMN user_assets.asset_type IS 'Type of asset: logo, signature, or stamp';
COMMENT ON COLUMN user_assets.is_default IS 'Whether this asset is the default for its type';

