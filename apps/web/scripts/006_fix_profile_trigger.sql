-- Corrigir trigger para usar UPSERT e adicionar full_name
-- Primeiro, adicionar coluna full_name se não existir
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Atualizar função do trigger para usar UPSERT e ler metadata corretamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
  user_status TEXT;
  user_plan TEXT;
  user_full_name TEXT;
BEGIN
  -- Ler valores do metadata (raw_user_meta_data contém os dados passados no signUp)
  user_role := COALESCE(new.raw_user_meta_data->>'role', 'user');
  user_status := COALESCE(new.raw_user_meta_data->>'status', 'inactive');
  user_plan := COALESCE(new.raw_user_meta_data->>'plan', 'free');
  user_full_name := COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));

  -- Inserir ou atualizar profile
  INSERT INTO public.profiles (id, email, full_name, role, status, plan)
  VALUES (
    new.id, 
    new.email, 
    user_full_name,
    user_role,
    user_status,
    user_plan
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

-- Nota: O trigger usa SECURITY DEFINER, então ele pode inserir/atualizar
-- independente das políticas RLS. As políticas abaixo são para o código cliente.
-- Mas o trigger sempre funcionará porque usa SECURITY DEFINER.

-- Garantir que usuários possam atualizar seu próprio profile
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Garantir que usuários possam inserir seu próprio profile (caso o trigger não funcione)
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);
