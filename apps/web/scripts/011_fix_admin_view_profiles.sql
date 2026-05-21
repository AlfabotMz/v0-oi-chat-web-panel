-- Solução para permitir que admin veja todos os perfis
-- Usa uma função SECURITY DEFINER que bypassa RLS para verificar role

-- Função helper para verificar se o usuário atual é admin
-- IMPORTANTE: Esta função precisa ler o próprio perfil do usuário
-- sem passar por RLS para evitar recursão infinita
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
  current_user_id UUID;
BEGIN
  -- Obter ID do usuário atual
  current_user_id := auth.uid();
  
  -- Verificar se o usuário está autenticado
  IF current_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Buscar role do usuário atual
  -- Como esta função usa SECURITY DEFINER, ela executa com privilégios elevados
  -- Mas ainda precisa passar por RLS, então precisamos garantir que a política básica
  -- (usuário vê seu próprio perfil) esteja ativa ANTES desta função ser chamada
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = current_user_id;
  
  -- Se não encontrou o perfil, retornar false
  IF user_role IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Retornar true se for admin
  RETURN user_role = 'admin';
EXCEPTION
  WHEN OTHERS THEN
    -- Em caso de erro, retornar false
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Remover TODAS as políticas conflitantes existentes
DROP POLICY IF EXISTS "Admins podem ver todos os perfis" ON profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_select_own_simple" ON profiles;
DROP POLICY IF EXISTS "profiles_select_admin" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;

-- CRÍTICO: Criar políticas na ordem correta para evitar recursão
-- 1. PRIMEIRO: Política que permite usuário ver seu próprio perfil (SEM usar is_admin())
-- Esta política DEVE ser avaliada primeiro para permitir que is_admin() funcione
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- 2. SEGUNDO: Política que permite admin ver todos os perfis
-- Esta política usa is_admin(), que por sua vez precisa ler o próprio perfil do admin
-- Como a política acima permite que o admin veja seu próprio perfil,
-- is_admin() conseguirá funcionar sem recursão
CREATE POLICY "profiles_select_admin" ON profiles
  FOR SELECT
  USING (public.is_admin() = true);

-- 3. Política de inserção - usuário pode inserir seu próprio perfil
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 4. Política de atualização - usuário pode atualizar seu próprio perfil
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 5. Política de atualização - admin pode atualizar qualquer perfil
CREATE POLICY "profiles_update_admin" ON profiles
  FOR UPDATE
  USING (public.is_admin() = true)
  WITH CHECK (public.is_admin() = true);

-- 6. Política de deleção - usuário pode deletar seu próprio perfil
CREATE POLICY "profiles_delete_own" ON profiles
  FOR DELETE
  USING (auth.uid() = id);

-- Comentários explicativos
COMMENT ON FUNCTION public.is_admin() IS 
'Verifica se o usuário atual é admin. Usa SECURITY DEFINER mas ainda passa por RLS. 
Depende da política profiles_select_own para ler o próprio perfil do usuário.';

COMMENT ON POLICY "profiles_select_own" ON profiles IS 
'Permite que usuários vejam seu próprio perfil. DEVE estar ativa antes de profiles_select_admin.';

COMMENT ON POLICY "profiles_select_admin" ON profiles IS 
'Permite que admins vejam todos os perfis. Usa is_admin() que depende de profiles_select_own.';

COMMENT ON POLICY "profiles_update_admin" ON profiles IS 
'Permite que admins atualizem qualquer perfil. Usa is_admin() para verificação.';
