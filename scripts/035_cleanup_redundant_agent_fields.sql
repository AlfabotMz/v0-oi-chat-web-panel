-- Migration: 035_cleanup_redundant_agent_fields.sql
-- Description: Remove redundant columns from agents table after architectural centralization

ALTER TABLE public.agents
DROP COLUMN IF EXISTS product_name,
DROP COLUMN IF EXISTS product_price,
DROP COLUMN IF EXISTS delivery_number,
DROP COLUMN IF EXISTS whatsapp_number;

-- Verify columns in contact_owner and contact_delivery are NOT dropped
-- (These are the ones we decided to keep and centralize on)
