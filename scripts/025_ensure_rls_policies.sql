-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;

-- Create policies
-- Allow users to view their own profile
CREATE POLICY "profiles_select_own" ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "profiles_update_own" ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow users to insert their own profile (needed for manual creation if trigger fails or for initial setup)
CREATE POLICY "profiles_insert_own" ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Admin policies (if needed, usually handled by separate admin policies or is_admin function)
-- We'll assume admin policies are handled in 011_fix_admin_view_profiles.sql, but we can add a basic one here if needed.
-- For now, let's focus on the user flow which was failing.
