-- Reseta todos os usuários para o plano 'free' e limpa informações de assinatura/trial

UPDATE public.profiles
SET 
  plan = 'free',
  subscription_status = 'active',
  plan_start_date = NOW(),
  plan_end_date = NULL,
  trial_used = FALSE;
