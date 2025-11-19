-- Adicionar campos de suporte à tabela profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS community_link TEXT,
ADD COLUMN IF NOT EXISTS support_whatsapp_link TEXT;

-- Comentários para documentação
COMMENT ON COLUMN profiles.community_link IS 'Link para a comunidade OiChat (configurado pelo admin)';
COMMENT ON COLUMN profiles.support_whatsapp_link IS 'Link do WhatsApp para suporte (configurado pelo admin)';
