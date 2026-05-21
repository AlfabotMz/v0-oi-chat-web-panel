-- Garantir que usuários possam atualizar seu próprio profile durante o signup
-- Isso é importante para garantir que role, status e plan sejam definidos corretamente

-- Remover política antiga se existir
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

-- Criar política que permite usuário atualizar seu próprio profile
-- Isso permite que o código atualize o profile após o trigger criar
CREATE POLICY "profiles_update_own" ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Garantir que a política de inserção permite criação via trigger
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Nota: O trigger handle_new_user usa SECURITY DEFINER, então pode inserir/atualizar
-- independente das políticas RLS. Mas após a criação, o código cliente precisa
-- poder atualizar para garantir que os valores corretos sejam salvos.
