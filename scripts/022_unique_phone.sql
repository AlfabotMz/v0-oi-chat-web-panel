-- Add unique constraint to whatsapp column in profiles table
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_whatsapp_key UNIQUE (whatsapp);

-- Optional: If you want to ensure whatsapp is not null in the future, you might need to clean up existing data first
-- For now, we just add the unique constraint which allows multiple NULLs but unique non-null values
