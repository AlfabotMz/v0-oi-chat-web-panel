-- Atualizar a função handle_new_user para 7 dias de trial
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
  user_status TEXT;
  user_plan TEXT;
  user_full_name TEXT;
  trial_end TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Ler de raw_user_meta_data
  user_role := COALESCE(new.raw_user_meta_data->>'role', 'user');
  user_status := COALESCE(new.raw_user_meta_data->>'status', 'inactive');
  user_plan := COALESCE(new.raw_user_meta_data->>'plan', 'business');
  user_full_name := COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));
  
  -- Trial de 7 dias
  trial_end := NOW() + INTERVAL '7 days';

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
    access_type
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
    'subscription'
  );
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
