-- Add unique constraint to phone column in profiles table
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_phone_key UNIQUE (phone);

-- Optional: If you want to ensure phone is not null in the future, you might need to clean up existing data first
-- For now, we just add the unique constraint which allows multiple NULLs but unique non-null values
