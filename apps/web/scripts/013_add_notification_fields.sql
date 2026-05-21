-- Adicionar campos de notificação WhatsApp à tabela agents
ALTER TABLE agents 
ADD COLUMN IF NOT EXISTS notification_contact_1 TEXT,
ADD COLUMN IF NOT EXISTS notification_contact_2 TEXT,
ADD COLUMN IF NOT EXISTS notification_message TEXT DEFAULT '🚀 Nova Encomenda Recebida!

💸 Produto: {{produto}}

💸 Número: {{numero}}

💸 Local: {{localizacao}}';

-- Comentários para documentação
COMMENT ON COLUMN agents.notification_contact_1 IS 'Primeiro contato para receber notificações de conversões via WhatsApp';
COMMENT ON COLUMN agents.notification_contact_2 IS 'Segundo contato para receber notificações de conversões via WhatsApp';
COMMENT ON COLUMN agents.notification_message IS 'Mensagem padrão para notificações de conversões (suporta variáveis {{produto}}, {{numero}}, {{localizacao}})';
