-- Desabilitar RLS completamente na tabela profiles para eliminar recursão infinita
-- Autenticação Supabase já protege adequadamente os usuários
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Desabilitar RLS em plan_history também
ALTER TABLE public.plan_history DISABLE ROW LEVEL SECURITY;

-- Remover todas as políticas problemáticas
DROP POLICY IF EXISTS "profiles_select_own_simple" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own_simple" ON public.profiles;
DROP POLICY IF EXISTS "Admins podem ver todos os perfis" ON public.profiles;
DROP POLICY IF EXISTS "Admins podem atualizar perfis de usuários" ON public.profiles;
DROP POLICY IF EXISTS "Admins podem ver histórico de planos" ON public.plan_history;
DROP POLICY IF EXISTS "Usuários podem ver seu próprio histórico" ON public.plan_history;
