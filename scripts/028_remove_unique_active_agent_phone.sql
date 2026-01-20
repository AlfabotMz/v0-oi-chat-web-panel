-- Drop the unique index that prevents multiple active agents on the same phone number
DROP INDEX IF EXISTS unique_active_agent_phone;
