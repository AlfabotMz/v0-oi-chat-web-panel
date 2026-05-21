-- Add onboarding fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS whatsapp TEXT,
ADD COLUMN IF NOT EXISTS business_type TEXT,
ADD COLUMN IF NOT EXISTS monthly_revenue TEXT,
ADD COLUMN IF NOT EXISTS market TEXT;

-- Add comment to columns
COMMENT ON COLUMN public.profiles.whatsapp IS 'WhatsApp number collected during onboarding';
COMMENT ON COLUMN public.profiles.business_type IS 'Type of business (Dropshipping, PLR, etc)';
COMMENT ON COLUMN public.profiles.monthly_revenue IS 'Estimated monthly revenue';
COMMENT ON COLUMN public.profiles.market IS 'Target market';
