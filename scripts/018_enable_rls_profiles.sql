-- Re-habilitar RLS na tabela profiles
-- Isso é crítico para garantir que as políticas definidas em 011_fix_admin_view_profiles.sql funcionem
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Garantir que RLS também esteja habilitado em plan_history
ALTER TABLE public.plan_history ENABLE ROW LEVEL SECURITY;
