-- Add UI language preference to company_settings table
ALTER TABLE company_settings 
ADD COLUMN IF NOT EXISTS ui_language TEXT DEFAULT 'en' CHECK (ui_language IN ('en', 'zh-TW'));

-- Add comment for documentation
COMMENT ON COLUMN company_settings.ui_language IS 'User interface language preference: en (English) or zh-TW (Traditional Chinese)';


