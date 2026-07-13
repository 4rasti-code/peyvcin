-- Add reactions column to both messaging tables
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS reactions JSONB DEFAULT '{}'::JSONB;
ALTER TABLE public.private_messages ADD COLUMN IF NOT EXISTS reactions JSONB DEFAULT '{}'::JSONB;
