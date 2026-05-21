-- Adicionar colunas de admin, plano e status à tabela profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'premium')),
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'inactive' CHECK (status IN ('active', 'inactive')),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Criar tabela para rastrear histórico de planos
CREATE TABLE IF NOT EXISTS plan_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  old_plan TEXT,
  new_plan TEXT NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at_trigger ON profiles;
CREATE TRIGGER update_profiles_updated_at_trigger
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_profiles_updated_at();

-- Habilitar RLS para plan_history
ALTER TABLE plan_history ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para plan_history
CREATE POLICY "Admins podem ver histórico de planos"
  ON plan_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Usuários podem ver seu próprio histórico"
  ON plan_history FOR SELECT
  USING (user_id = auth.uid());

-- Atualizar política para permitir que admin veja e atualize profiles de usuários
CREATE POLICY "Admins podem ver todos os perfis"
  ON profiles FOR SELECT
  USING (
    id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins podem atualizar perfis de usuários"
  ON profiles FOR UPDATE
  USING (
    id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
