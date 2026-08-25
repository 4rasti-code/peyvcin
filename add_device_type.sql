ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS device_type text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS device_language text;
