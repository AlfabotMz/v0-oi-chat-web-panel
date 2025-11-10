-- Criar bucket para anexos de agentes
-- Nota: Este script precisa ser executado no Supabase Dashboard > Storage > Create Bucket
-- Ou via API do Supabase

-- Criar política para permitir upload de arquivos
-- (Execute isso após criar o bucket manualmente)

-- Política para usuários autenticados fazerem upload
CREATE POLICY "Usuários autenticados podem fazer upload de anexos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'agent-attachments' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para usuários autenticados visualizarem anexos
CREATE POLICY "Usuários autenticados podem visualizar anexos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'agent-attachments');

-- Política para usuários autenticados deletarem seus próprios anexos
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
);

-- NOTA: Para criar o bucket, execute no Supabase Dashboard:
-- 1. Vá para Storage > Buckets
-- 2. Clique em "Create Bucket"
-- 3. Nome: agent-attachments
-- 4. Público: Não (privado)
-- 5. File size limit: 50 MB (ou conforme necessário)
-- 6. Allowed MIME types: image/*, video/*, application/pdf (ou conforme necessário)

