-- Adicionar coluna para rastrear conclusão do onboarding
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Documentar a coluna
COMMENT ON COLUMN public.profiles.onboarding_completed IS 'Indica se o usuário concluiu o fluxo de configuração inicial (onboarding)';
