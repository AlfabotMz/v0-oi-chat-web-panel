-- 1. Alterar o valor padrão da coluna custom_message para usar chaves em inglês
ALTER TABLE public.agents 
ALTER COLUMN custom_message SET DEFAULT '🚀 Nova Encomenda Recebida!

💸 Produto: {{product}}

💸 Quantidade: {{quantity}}

💸 Valor: {{price}}

💸 Número: {{phone}}

💸 Local: {{location}}

💸 Data: {{date}}';

-- 2. Atualizar as ocorrências das antigas chaves em português para inglês nas mensagens existentes
UPDATE public.agents
SET custom_message = REPLACE(custom_message, '{{produto}}', '{{product}}');

UPDATE public.agents
SET custom_message = REPLACE(custom_message, '{{quantidade}}', '{{quantity}}');

UPDATE public.agents
SET custom_message = REPLACE(custom_message, '{{valor}}', '{{price}}');

UPDATE public.agents
SET custom_message = REPLACE(custom_message, '{{numero}}', '{{phone}}');

UPDATE public.agents
SET custom_message = REPLACE(custom_message, '{{localizacao}}', '{{location}}');
