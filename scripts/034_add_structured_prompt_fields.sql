-- Migration: 034_add_structured_prompt_fields.sql
-- Description: Add fields for structured prompt generation and migrate existing agents

-- 1. Add new columns to agents table
ALTER TABLE public.agents
ADD COLUMN IF NOT EXISTS prompt_type text DEFAULT 'dropshipper',
ADD COLUMN IF NOT EXISTS audience text,
ADD COLUMN IF NOT EXISTS tone text,
ADD COLUMN IF NOT EXISTS product_description text,
ADD COLUMN IF NOT EXISTS prompt_generated text;

-- 2. Migrate existing agents to 'personalizado'
UPDATE public.agents
SET prompt_type = 'personalizado'
WHERE prompt_type = 'dropshipper';

-- 3. Add comments for documentation
COMMENT ON COLUMN public.agents.prompt_type IS 'Type of prompt generation (dropshipper, support, personalizado)';
COMMENT ON COLUMN public.agents.audience IS 'Target audience (Feminino, Masculino, Ambos)';
COMMENT ON COLUMN public.agents.tone IS 'Tone of voice (Sério, Engraçado, Direto)';
COMMENT ON COLUMN public.agents.product_description IS 'Detailed product description and benefits';
COMMENT ON COLUMN public.agents.prompt_generated IS 'The final system prompt generated from structured data';
