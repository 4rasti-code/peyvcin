-- ==========================================
-- DAILY REWARD SYSTEM MIGRATION
-- ==========================================

-- Add tracking columns for the 7-day reward cycle
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS reward_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_reward_claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Ensure these columns are synced in the handle_new_user function if needed,
-- but the default values take care of it for existing and new users.

-- Enable Realtime for these columns (Handled at table level in supabase_setup.sql)
