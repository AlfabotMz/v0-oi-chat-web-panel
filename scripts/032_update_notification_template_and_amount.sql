-- 1. Adicionar apenas o campo amount (valor) à tabela agents
ALTER TABLE public.agents
ADD COLUMN IF NOT EXISTS amount TEXT;

-- 2. Atualizar o template de notificação de todos os usuários existentes
UPDATE public.agents
SET custom_message = '🚀 Nova Encomenda Recebida!

💸 Produto: {{product}}

💸 Quantidade de unidades: {{quantity}}

💸 Valor: {{amount}}

💸 Número: {{number}}

💸 Local: {{location}}';

-- 3. Comentário para documentação
COMMENT ON COLUMN public.agents.amount IS 'Valor monetário configurado para o produto do agente';
