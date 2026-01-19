-- Dedicated schema for Kino
CREATE SCHEMA IF NOT EXISTS kino;

-- Business profiles table for multi-entity support (scoped to kino schema)
CREATE TABLE IF NOT EXISTS kino.business_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  tax_id TEXT,
  bank_name TEXT,
  account_number TEXT,
  fps_id TEXT,
  swift_code TEXT,
  paypal_email TEXT,
  default_invoice_notes TEXT,
  default_contract_terms TEXT,
  default_payment_notes TEXT,
  is_default BOOLEAN DEFAULT false
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_business_profiles_user_id ON kino.business_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_business_profiles_default ON kino.business_profiles(user_id) WHERE is_default = true;

-- Ensure only one default profile per user
CREATE UNIQUE INDEX IF NOT EXISTS uidx_business_profiles_single_default
  ON kino.business_profiles(user_id)
  WHERE is_default = true;

-- RLS
ALTER TABLE kino.business_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their business profiles"
  ON kino.business_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their business profiles"
  ON kino.business_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their business profiles"
  ON kino.business_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their business profiles"
  ON kino.business_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- Comments for clarity
COMMENT ON TABLE kino.business_profiles IS 'Stores multiple business identities per user (branding, payments, notes).';
COMMENT ON COLUMN kino.business_profiles.is_default IS 'Marks the active/default business profile for the user.';
