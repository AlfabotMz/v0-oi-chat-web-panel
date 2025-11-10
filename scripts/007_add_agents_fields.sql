-- Adicionar campos prompt, anexos, instance_id e whatsapp_status à tabela agents
ALTER TABLE agents 
ADD COLUMN IF NOT EXISTS prompt TEXT,
ADD COLUMN IF NOT EXISTS anexos JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS instance_id TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_status TEXT DEFAULT 'disconnected' CHECK (whatsapp_status IN ('disconnected', 'pending', 'connected', 'error'));

-- Criar índice para busca por instance_id
CREATE INDEX IF NOT EXISTS idx_agents_instance_id ON agents(instance_id);

-- Comentários para documentação
COMMENT ON COLUMN agents.prompt IS 'Prompt do agente para interações com IA';
COMMENT ON COLUMN agents.anexos IS 'Objeto JSON com anexos. Formato: {"nome_anexo": ["url1", "url2", ...]}';
COMMENT ON COLUMN agents.instance_id IS 'ID da instância do WhatsApp na Evolution API';
COMMENT ON COLUMN agents.whatsapp_status IS 'Status da conexão WhatsApp: disconnected, pending, connected, error';

