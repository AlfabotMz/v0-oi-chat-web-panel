-- Remover campos welcome_message e description da tabela agents
ALTER TABLE agents 
DROP COLUMN IF EXISTS welcome_message,
DROP COLUMN IF EXISTS description;

-- Comentário para documentação
COMMENT ON TABLE agents IS 'Tabela de agentes - campos welcome_message e description removidos';
