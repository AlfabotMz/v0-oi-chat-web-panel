-- Update role constraint to include 'moder'
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('admin', 'user', 'moder'));

-- Ensure plan constraint allows 'pro' (it should already, but good to verify/enforce if needed)
-- ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_plan_check;
-- ALTER TABLE public.profiles ADD CONSTRAINT profiles_plan_check CHECK (plan IN ('free', 'pro', 'premium'));
