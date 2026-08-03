ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS owned_emojis TEXT[] DEFAULT ARRAY['default']::TEXT[];
