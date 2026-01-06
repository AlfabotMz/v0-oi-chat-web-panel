-- Add access_type column to profiles table
-- Values: 'subscription' (default, counts for MRR), 'manual' (granted by admin, free, excluded from MRR)

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS access_type TEXT DEFAULT 'subscription' CHECK (access_type IN ('subscription', 'manual'));

-- Update existing active pro/premium users to have 'subscription' access_type (default handles new ones)
UPDATE public.profiles 
SET access_type = 'subscription' 
WHERE plan IN ('pro', 'premium');
