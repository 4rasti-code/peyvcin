-- Add last_notified_level column to profiles table
-- Default to 1 to match the starting level
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_notified_level INTEGER DEFAULT 1;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.last_notified_level IS 'The highest level for which the user has been shown the Level Up modal.';
