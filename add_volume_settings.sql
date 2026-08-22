-- ==========================================
-- Peyvok: VOLUME SETTINGS MIGRATION
-- Run this in your Supabase SQL Editor
-- ==========================================

-- Add volume settings columns to profiles table if they don't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS sfx_volume INTEGER DEFAULT 20;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bg_music_volume INTEGER DEFAULT 3;
