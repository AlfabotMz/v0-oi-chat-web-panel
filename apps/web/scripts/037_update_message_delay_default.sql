-- Update the default value for message_delay to 5 seconds
ALTER TABLE public.agents
ALTER COLUMN message_delay SET DEFAULT 5;

-- Optional: Update existing agents that have 0 delay to 5 (if desired by user, assuming yes for "default")
-- UPDATE public.agents SET message_delay = 5 WHERE message_delay = 0;
