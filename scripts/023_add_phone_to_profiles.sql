-- Add phone column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Add comment
COMMENT ON COLUMN public.profiles.phone IS 'User phone number';

-- If whatsapp column exists, copy data to phone for consistency
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'whatsapp') THEN
        UPDATE public.profiles SET phone = whatsapp WHERE phone IS NULL;
    END IF;
END $$;
