-- Adicionar campos prompt e anexos à tabela agents
ALTER TABLE agents 
ADD COLUMN IF NOT EXISTS prompt TEXT,
ADD COLUMN IF NOT EXISTS anexos JSONB DEFAULT '{}'::jsonb;

-- Comentários para documentação
COMMENT ON COLUMN agents.prompt IS 'Prompt do agente para interações com IA';
COMMENT ON COLUMN agents.anexos IS 'Objeto JSON com anexos. Formato: {"nome_anexo": ["url1", "url2", ...]}';
