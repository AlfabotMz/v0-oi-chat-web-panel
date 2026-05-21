-- Adicionar campos de assinatura na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trial', -- active, trial, expired, cancelled
ADD COLUMN IF NOT EXISTS plan_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS plan_end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_payment_id TEXT,
ADD COLUMN IF NOT EXISTS trial_used BOOLEAN DEFAULT FALSE;

-- Criar tabela de pagamentos para histórico
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'MZN',
    status TEXT NOT NULL, -- pending, completed, failed
    payment_method TEXT NOT NULL, -- mpesa, emola
    phone_number TEXT,
    transaction_id TEXT, -- ID da transação no gateway (PayMoz)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS na tabela payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para payments
-- Usuários podem ver seus próprios pagamentos
CREATE POLICY "Users can view own payments" ON public.payments
    FOR SELECT USING (auth.uid() = user_id);

-- Apenas sistema/admin pode inserir (via API) - mas como usamos service role na API, 
-- podemos deixar restrito ou permitir insert autenticado se formos usar client-side (não recomendado para pagamentos)
-- Vamos permitir que o usuário veja, mas a inserção será feita pelo backend com service role.

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON public.profiles(subscription_status);
