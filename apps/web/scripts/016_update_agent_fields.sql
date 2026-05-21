-- Rename notification contact columns
ALTER TABLE public.agents 
RENAME COLUMN notification_contact_1 TO contact_owner;

ALTER TABLE public.agents 
RENAME COLUMN notification_contact_2 TO contact_delivery;

-- Add new columns
ALTER TABLE public.agents 
ADD COLUMN IF NOT EXISTS product TEXT,
ADD COLUMN IF NOT EXISTS custom_message TEXT DEFAULT '🚀 Nova Encomenda Recebida!

💸 Produto: {{product}}
💸 Número: {{number}}
💸 Local: {{location}}';

-- Update comments
COMMENT ON COLUMN agents.contact_owner IS 'Owner contact for notifications';
COMMENT ON COLUMN agents.contact_delivery IS 'Delivery contact for notifications';
COMMENT ON COLUMN agents.product IS 'Product being sold by the agent';
COMMENT ON COLUMN agents.custom_message IS 'Custom notification message template';
