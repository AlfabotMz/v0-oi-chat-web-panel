-- Desabilitar políticas antigas da tabela profiles que causam recursão
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;

-- Criar novas políticas sem recursão
CREATE POLICY "profiles_select_policy" ON public.profiles FOR SELECT 
  USING (auth.uid() = id OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "profiles_insert_policy" ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_policy" ON public.profiles FOR UPDATE 
  USING (auth.uid() = id OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "profiles_delete_policy" ON public.profiles FOR DELETE 
  USING (auth.uid() = id);

-- Desabilitar políticas antigas das outras tabelas que usam EXISTS
DROP POLICY IF EXISTS "conversations_select_own" ON public.conversations;
DROP POLICY IF EXISTS "conversations_insert_own" ON public.conversations;
DROP POLICY IF EXISTS "conversations_update_own" ON public.conversations;

CREATE POLICY "conversations_select" ON public.conversations FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.agents WHERE id = agent_id AND user_id = auth.uid()));

CREATE POLICY "conversations_insert" ON public.conversations FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.agents WHERE id = agent_id AND user_id = auth.uid()));

CREATE POLICY "conversations_update" ON public.conversations FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.agents WHERE id = agent_id AND user_id = auth.uid()));

-- Desabilitar políticas antigas das messages
DROP POLICY IF EXISTS "messages_select_own" ON public.messages;
DROP POLICY IF EXISTS "messages_insert_own" ON public.messages;

CREATE POLICY "messages_select" ON public.messages FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.conversations c 
    JOIN public.agents a ON c.agent_id = a.id 
    WHERE c.id = conversation_id AND a.user_id = auth.uid()
  ));

CREATE POLICY "messages_insert" ON public.messages FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.conversations c 
    JOIN public.agents a ON c.agent_id = a.id 
    WHERE c.id = conversation_id AND a.user_id = auth.uid()
  ));

-- Desabilitar políticas antigas do analytics
DROP POLICY IF EXISTS "analytics_select_own" ON public.analytics;
DROP POLICY IF EXISTS "analytics_insert_own" ON public.analytics;

CREATE POLICY "analytics_select" ON public.analytics FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.agents WHERE id = agent_id AND user_id = auth.uid()));

CREATE POLICY "analytics_insert" ON public.analytics FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.agents WHERE id = agent_id AND user_id = auth.uid()));
