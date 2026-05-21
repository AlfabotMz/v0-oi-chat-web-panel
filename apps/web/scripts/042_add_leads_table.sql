-- Remove if already exists
DROP TABLE IF EXISTS public.leads CASCADE;

-- Leads table
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  user_number TEXT,
  form TEXT,
  date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for leads
-- Owner of the agent can view their leads
CREATE POLICY "leads_select_own" ON public.leads FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.agents WHERE agents.id = leads.agent_id AND agents.user_id = auth.uid())
);

-- We need to allow insert without authentication because it's called by a webhook from external API
-- But actually, the webhook script will use Service Role Key, which bypasses RLS.
-- So we only need the select policy for the frontend users.

CREATE POLICY "leads_insert_own" ON public.leads FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.agents WHERE agents.id = leads.agent_id AND agents.user_id = auth.uid())
);

CREATE POLICY "leads_update_own" ON public.leads FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.agents WHERE agents.id = leads.agent_id AND agents.user_id = auth.uid())
);

CREATE POLICY "leads_delete_own" ON public.leads FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.agents WHERE agents.id = leads.agent_id AND agents.user_id = auth.uid())
);

