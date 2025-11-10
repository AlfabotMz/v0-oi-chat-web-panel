-- Corrigir trigger para usar UPSERT e adicionar full_name
-- Primeiro, adicionar coluna full_name se não existir
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Atualizar função do trigger para usar UPSERT
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, status, plan)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'role', 'user'),
    COALESCE(new.raw_user_meta_data->>'status', 'inactive'),
    COALESCE(new.raw_user_meta_data->>'plan', 'free')
  )
  ON CONFLICT (id) 
  DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    updated_at = NOW();
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Garantir que a política de inserção permite a criação via trigger
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id OR auth.jwt() ->> 'role' = 'service_role');

