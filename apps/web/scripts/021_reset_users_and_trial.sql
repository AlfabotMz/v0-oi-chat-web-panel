-- Reset all users to 'pro' plan with 7-day trial based on CREATION DATE
-- This script should be run manually in Supabase SQL Editor

-- 1. Update profiles to set plan to 'pro' (Business)
-- The trial start date is the user's creation date (created_at).
-- The trial end date is creation date + 7 days.
-- If the user created the account more than 7 days ago, the trial will be expired immediately.

UPDATE public.profiles
SET 
  plan = 'pro',
  subscription_status = 'trial',
  plan_start_date = created_at,
  plan_end_date = created_at + INTERVAL '7 days',
  status = 'active',
  trial_used = FALSE;

-- 2. Ensure we have the whatsapp column (it should exist, but just in case we populate it from phone if empty and phone exists)
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
  user_plan := 'pro'; -- Force pro for trial
  user_full_name := COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));
  
  -- Set trial end date to 7 days from creation (which is NOW() for new users)
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
    trial_used,
    created_at,
    updated_at
  )
  VALUES (
    new.id, 
    new.email, 
    user_full_name,
    user_role,
    user_status,
    user_plan,
    'trial',
    NOW(), -- plan_start_date
    trial_end, -- plan_end_date
    FALSE,
    NOW(), -- created_at
    NOW()  -- updated_at
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
