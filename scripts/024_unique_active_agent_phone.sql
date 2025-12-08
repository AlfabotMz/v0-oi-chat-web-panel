-- Create a unique index on agents(phone_number) where status is 'active'
-- This ensures that a phone number can only be associated with ONE active agent at a time.
-- Inactive agents can share the same phone number (or have it set), but only one can be active.

CREATE UNIQUE INDEX IF NOT EXISTS unique_active_agent_phone 
ON public.agents (phone_number) 
WHERE status = 'active' AND phone_number IS NOT NULL;

COMMENT ON INDEX unique_active_agent_phone IS 'Ensures only one agent is active per phone number';
