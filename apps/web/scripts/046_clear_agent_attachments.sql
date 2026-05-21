-- Limpar bucket de storage 'agent-attachments' e resetar anexos dos agentes
-- ATENÇÃO: Isto irá apagar TODOS os arquivos físicos no bucket 'agent-attachments' no Supabase
-- e resetar as listas de anexos de todos os agentes no banco de dados.

-- 1. Deletar todos os arquivos/objetos do storage para o bucket 'agent-attachments'
-- (No Supabase, deletar da tabela storage.objects dispara automaticamente os triggers internos
-- que removem os arquivos físicos do storage/S3).
DELETE FROM storage.objects 
WHERE bucket_id = 'agent-attachments';

-- 2. Resetar o campo de anexos (anexos) de todos os agentes para um JSON vazio '{}'
UPDATE public.agents 
SET anexos = '{}'::jsonb;
