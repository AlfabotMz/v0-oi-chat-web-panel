-- Corrigir políticas de storage para permitir upload de anexos
-- Este script remove as políticas antigas e cria novas políticas mais permissivas

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "Usuários autenticados podem fazer upload de anexos" ON storage.objects;
DROP POLICY IF EXISTS "Usuários autenticados podem visualizar anexos" ON storage.objects;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar anexos" ON storage.objects;
DROP POLICY IF EXISTS "Admins podem gerenciar todos os anexos" ON storage.objects;

-- Política para usuários autenticados fazerem upload de anexos
-- Permite upload para qualquer path dentro do bucket agent-attachments
CREATE POLICY "Usuários autenticados podem fazer upload de anexos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'agent-attachments'
);

-- Política para usuários autenticados visualizarem anexos
CREATE POLICY "Usuários autenticados podem visualizar anexos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'agent-attachments');

-- Política para usuários autenticados atualizarem anexos
CREATE POLICY "Usuários autenticados podem atualizar anexos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'agent-attachments')
WITH CHECK (bucket_id = 'agent-attachments');

-- Política para usuários autenticados deletarem anexos
CREATE POLICY "Usuários autenticados podem deletar anexos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'agent-attachments');

-- Política para admins gerenciarem todos os anexos
CREATE POLICY "Admins podem gerenciar todos os anexos"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'agent-attachments' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
)
WITH CHECK (
  bucket_id = 'agent-attachments' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

