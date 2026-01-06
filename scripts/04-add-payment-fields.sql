-- Add payment and banking fields to company_settings table

ALTER TABLE company_settings
ADD COLUMN IF NOT EXISTS company_phone TEXT,
ADD COLUMN IF NOT EXISTS paypal_email TEXT,
ADD COLUMN IF NOT EXISTS default_contract_terms TEXT,
ADD COLUMN IF NOT EXISTS default_invoice_notes TEXT;

-- Add comment for documentation
COMMENT ON COLUMN company_settings.company_phone IS 'Company contact phone number';
COMMENT ON COLUMN company_settings.paypal_email IS 'PayPal email for payments';
COMMENT ON COLUMN company_settings.default_contract_terms IS 'Default terms and conditions for contracts';
COMMENT ON COLUMN company_settings.default_invoice_notes IS 'Default notes for invoices';


