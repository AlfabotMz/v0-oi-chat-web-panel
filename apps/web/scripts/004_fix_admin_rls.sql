-- Remover todas as políticas existentes para evitar recursão
DROP POLICY IF EXISTS "Admins podem ver todos os perfis" ON profiles;
DROP POLICY IF EXISTS "Admins podem atualizar perfis de usuários" ON profiles;
DROP POLICY IF EXISTS "Admins podem ver histórico de planos" ON plan_history;
DROP POLICY IF EXISTS "Usuários podem ver seu próprio histórico" ON plan_history;
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;

-- Políticas simples sem recursão
-- Usuários veem apenas seu próprio perfil
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_delete_own" ON profiles
  FOR DELETE USING (auth.uid() = id);

-- Políticas para plan_history
ALTER TABLE plan_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "plan_history_select" ON plan_history
  FOR SELECT USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM auth.users u WHERE u.id = auth.uid()
  ));

CREATE POLICY "plan_history_insert" ON plan_history
  FOR INSERT WITH CHECK (true);
