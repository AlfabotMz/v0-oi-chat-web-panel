-- Remove todos os agentes da base de dados
-- ATENÇÃO: Devido ao ON DELETE CASCADE configurado na criação das tabelas,
-- isto vai apagar em cascata todas as conversas (conversations), 
-- mensagens (messages), e analíticas (analytics) relacionadas a esses agentes.

DELETE FROM public.agents;
