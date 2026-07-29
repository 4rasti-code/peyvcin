-- Add bundle support columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS equipped_bundle VARCHAR(50) DEFAULT 'default',
ADD COLUMN IF NOT EXISTS owned_bundles TEXT[] DEFAULT ARRAY['default']::TEXT[];

-- Ensure 'default' is always in owned_bundles
UPDATE public.profiles 
SET owned_bundles = array_append(owned_bundles, 'default') 
WHERE NOT ('default' = ANY(owned_bundles));
