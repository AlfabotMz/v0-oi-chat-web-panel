-- First, resolve existing duplicates by keeping only the most recently updated agent active
-- and setting others to 'inactive'.

WITH duplicates AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY phone_number ORDER BY updated_at DESC) as rn
  FROM public.agents
  WHERE status = 'active' AND phone_number IS NOT NULL
)
UPDATE public.agents
SET status = 'inactive'
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Now that duplicates are resolved, create the unique index
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_agent_phone 
ON public.agents (phone_number) 
WHERE status = 'active' AND phone_number IS NOT NULL;

COMMENT ON INDEX unique_active_agent_phone IS 'Ensures only one agent is active per phone number';
