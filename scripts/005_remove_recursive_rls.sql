-- Remover TODAS as políticas problemáticas que causam recursão
DROP POLICY IF EXISTS "Admins podem ver todos os perfis" ON public.profiles;
DROP POLICY IF EXISTS "Admins podem atualizar perfis de usuários" ON public.profiles;
DROP POLICY IF EXISTS "Admins podem ver histórico de planos" ON public.plan_history;
DROP POLICY IF EXISTS "Usuários podem ver seu próprio histórico" ON public.plan_history;

-- Manter apenas políticas de self-reference simples (sem recursão)
-- RLS para profiles - cada usuário vê apenas a si mesmo
CREATE POLICY "profiles_select_own_simple" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own_simple" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Desabilitar RLS para plan_history pois causa problemas
ALTER TABLE public.plan_history DISABLE ROW LEVEL SECURITY;
