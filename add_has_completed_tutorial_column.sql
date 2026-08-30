-- Add has_completed_tutorial column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS has_completed_tutorial BOOLEAN DEFAULT false;

-- Add it to the realtime publication if not already added (optional but good practice)
-- Supabase automatically includes new columns if the table is already in the publication
