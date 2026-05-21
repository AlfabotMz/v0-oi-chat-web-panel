-- Migration: 039_add_webhook_logs.sql
-- Description: Create logs table for Meta Webhook testing

CREATE TABLE IF NOT EXISTS public.waba_webhook_logs (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default now(),
    agent_id uuid references public.agents(id) on delete cascade,
    event_type text, -- 'message_received', 'status_sent', 'status_delivered', 'status_read'
    payload jsonb,
    phone_number text
);

ALTER TABLE public.waba_webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own webhook logs" 
    ON public.waba_webhook_logs 
    FOR SELECT 
    USING (auth.uid() IN (SELECT user_id FROM agents WHERE agents.id = waba_webhook_logs.agent_id));
