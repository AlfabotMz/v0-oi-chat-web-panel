-- Force 7-day trial for all new users and bypass Stripe check
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
  user_status := COALESCE(new.raw_user_meta_data->>'status', 'active');
  user_plan := 'pro'; -- Force pro for trial
  user_full_name := COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));
  
  -- Set trial end date to 7 days from creation
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
    access_type,
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
    NOW(),
    trial_end,
    FALSE,
    'subscription', -- Required for dashboard access type check
    NOW(),
    NOW()
  )
  ON CONFLICT (id) 
  DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    role = EXCLUDED.role,
    status = EXCLUDED.status,
    plan = EXCLUDED.plan,
    subscription_status = EXCLUDED.subscription_status,
    plan_start_date = EXCLUDED.plan_start_date,
    plan_end_date = EXCLUDED.plan_end_date,
    access_type = EXCLUDED.access_type,
    updated_at = NOW();
    
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
