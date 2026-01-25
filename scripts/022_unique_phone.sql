-- First, let's see if there are any duplicate whatsapp numbers
-- This query will show you which numbers are duplicated (if any)
-- SELECT whatsapp, COUNT(*) 
-- FROM public.profiles 
-- WHERE whatsapp IS NOT NULL 
-- GROUP BY whatsapp 
-- HAVING COUNT(*) > 1;

-- Option 1: Set duplicate whatsapp numbers to NULL (keeping only the first occurrence)
-- This will allow the unique constraint to be added
WITH duplicates AS (
  SELECT id, whatsapp,
    ROW_NUMBER() OVER (PARTITION BY whatsapp ORDER BY created_at ASC) as rn
  FROM public.profiles
  WHERE whatsapp IS NOT NULL
)
UPDATE public.profiles
SET whatsapp = NULL
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Now add the unique constraint to whatsapp column
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_whatsapp_key UNIQUE (whatsapp);

-- Note: The unique constraint allows multiple NULLs but requires unique non-null values
