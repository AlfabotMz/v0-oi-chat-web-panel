-- Migration: 038_add_waba_fields.sql
-- Description: Add fields to support WhatsApp Business API Embedded Signup

ALTER TABLE public.agents
ADD COLUMN IF NOT EXISTS waba_id text,
ADD COLUMN IF NOT EXISTS waba_phone_number_id text,
ADD COLUMN IF NOT EXISTS waba_business_account_id text,
ADD COLUMN IF NOT EXISTS waba_access_token text;
