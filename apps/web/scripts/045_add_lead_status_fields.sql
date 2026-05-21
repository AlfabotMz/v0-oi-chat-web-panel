-- Add status and is_read columns to leads
ALTER TABLE public.leads ADD COLUMN status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed'));
ALTER TABLE public.leads ADD COLUMN is_read BOOLEAN DEFAULT false;

-- We already handled RLS perfectly in 044:
-- CREATE POLICY "leads_update_own" ON public.leads FOR UPDATE USING (auth.uid() = user_id);
-- The above handles allowing the user to update status/is_read for their own leads.
