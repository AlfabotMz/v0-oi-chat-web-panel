-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "http";

-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Agents table
CREATE TABLE IF NOT EXISTS public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  phone_number TEXT,
  welcome_message TEXT,
  status TEXT DEFAULT 'active',
  n8n_webhook_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  contact_phone TEXT NOT NULL,
  contact_name TEXT,
  status TEXT DEFAULT 'active',
  last_message_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('agent', 'contact')),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Analytics table
CREATE TABLE IF NOT EXISTS public.analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  total_messages INT DEFAULT 0,
  total_conversations INT DEFAULT 0,
  avg_response_time INT,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- RLS Policies for agents
CREATE POLICY "agents_select_own" ON public.agents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "agents_insert_own" ON public.agents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "agents_update_own" ON public.agents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "agents_delete_own" ON public.agents FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for conversations
CREATE POLICY "conversations_select_own" ON public.conversations FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.agents WHERE agents.id = conversations.agent_id AND agents.user_id = auth.uid())
);
CREATE POLICY "conversations_insert_own" ON public.conversations FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.agents WHERE agents.id = conversations.agent_id AND agents.user_id = auth.uid())
);
CREATE POLICY "conversations_update_own" ON public.conversations FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.agents WHERE agents.id = conversations.agent_id AND agents.user_id = auth.uid())
);

-- RLS Policies for messages
CREATE POLICY "messages_select_own" ON public.messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.conversations c JOIN public.agents a ON c.agent_id = a.id WHERE c.id = messages.conversation_id AND a.user_id = auth.uid())
);
CREATE POLICY "messages_insert_own" ON public.messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.conversations c JOIN public.agents a ON c.agent_id = a.id WHERE c.id = messages.conversation_id AND a.user_id = auth.uid())
);

-- RLS Policies for analytics
CREATE POLICY "analytics_select_own" ON public.analytics FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.agents WHERE agents.id = analytics.agent_id AND agents.user_id = auth.uid())
);
CREATE POLICY "analytics_insert_own" ON public.analytics FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.agents WHERE agents.id = analytics.agent_id AND agents.user_id = auth.uid())
);

-- Create trigger function for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
