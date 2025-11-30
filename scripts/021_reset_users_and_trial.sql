-- Reset all users to 'business' plan with 7-day trial
-- This script should be run manually in Supabase SQL Editor

-- 1. Update profiles to set plan to 'business' (using 'premium' as internal value if that's what we use, 
-- but previous scripts used 'free', 'pro', 'premium'. User said "plano gratis" but context implies trial of paid.
-- I will use 'premium' as the internal value for the top tier).

UPDATE public.profiles
SET 
  plan = 'premium',
  subscription_status = 'trial',
  plan_start_date = NOW(),
  plan_end_date = NOW() + INTERVAL '7 days',
  status = 'active',
  trial_used = FALSE;

-- 2. Ensure we have the whatsapp column (it should exist, but just in case we populate it from phone if empty and phone exists)
-- Note: We are not creating columns here, just ensuring data consistency if needed.
-- If phone exists and whatsapp is null, copy phone to whatsapp.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone') THEN
    UPDATE public.profiles 
    SET whatsapp = phone 
    WHERE whatsapp IS NULL AND phone IS NOT NULL;
  END IF;
END $$;

-- 3. Update handle_new_user trigger to ensure NEW users also get this 7-day trial of premium
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
  user_status TEXT;
  user_plan TEXT;
  user_full_name TEXT;
  trial_end TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Ler valores do metadata
  user_role := COALESCE(new.raw_user_meta_data->>'role', 'user');
  user_status := COALESCE(new.raw_user_meta_data->>'status', 'active'); -- Active by default for trial
  user_plan := 'premium'; -- Force premium for trial
  user_full_name := COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));
  
  -- Set trial end date to 7 days from now
  trial_end := NOW() + INTERVAL '7 days';

  -- Inserir ou atualizar profile
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    role, 
    status, 
    plan,
    subscription_status,
    plan_start_date,
    plan_end_date,
    trial_used
  )
  VALUES (
    new.id, 
    new.email, 
    user_full_name,
    user_role,
    user_status,
    user_plan,
    'trial',
    NOW(),
    trial_end,
    FALSE
  )
  ON CONFLICT (id) 
  DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    plan = EXCLUDED.plan,
    updated_at = NOW();
    
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
