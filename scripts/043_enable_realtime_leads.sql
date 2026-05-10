-- Adiciona a tabela leads à publicação do Supabase Realtime
-- Isso é necessário para que as notificações cheguem do backend para o painel em tempo real

-- Checa se a tabela já está no publication para não dar erro
DO $$ 
BEGIN
  IF NOT EXISTS (
      SELECT 1
      FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'leads'
  ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;
  END IF;
END $$;
