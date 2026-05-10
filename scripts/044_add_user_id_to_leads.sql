-- Add user_id to leads table to simplify RLS for Supabase Realtime
ALTER TABLE public.leads ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Auto-fill existing leads user_id based on agent
UPDATE public.leads l
SET user_id = a.user_id
FROM public.agents a
WHERE l.agent_id = a.id;

-- Now make user_id NOT NULL for future
ALTER TABLE public.leads ALTER COLUMN user_id SET NOT NULL;

-- Drop old policies
DROP POLICY IF EXISTS "leads_select_own" ON public.leads;
DROP POLICY IF EXISTS "leads_insert_own" ON public.leads;
DROP POLICY IF EXISTS "leads_update_own" ON public.leads;
DROP POLICY IF EXISTS "leads_delete_own" ON public.leads;

-- Create new simplified policies that don't need joins (Realtime compatible)
CREATE POLICY "leads_select_own" ON public.leads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "leads_insert_own" ON public.leads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "leads_update_own" ON public.leads FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "leads_delete_own" ON public.leads FOR DELETE USING (auth.uid() = user_id);

-- Create trigger to automatically fill/verify user_id on insert if omitted
CREATE OR REPLACE FUNCTION public.set_lead_user_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    SELECT user_id INTO NEW.user_id FROM public.agents WHERE id = NEW.agent_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_set_lead_user_id ON public.leads;
CREATE TRIGGER trg_set_lead_user_id
  BEFORE INSERT ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.set_lead_user_id();
