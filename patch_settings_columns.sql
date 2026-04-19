-- ==========================================
-- PEYVÇÎN: SETTINGS SYNC MIGRATION
-- Run this in your Supabase SQL Editor
-- ==========================================

-- Add settings columns to profiles table if they don't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS sfx_volume INTEGER DEFAULT 20;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS music_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_theme TEXT DEFAULT 'default';

-- Note: haptic_enabled already exists in the schema.
