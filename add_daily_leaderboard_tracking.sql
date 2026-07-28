-- ==============================================================================
-- Migration: Add Daily Leaderboard Tracking via Triggers (Zero Side Effects)
-- Description: Adds a daily_xp column and uses a DB trigger to safely accumulate
--              daily XP whenever the main XP increases, ensuring no existing 
--              RPCs or app logic need to be modified.
-- ==============================================================================

-- 1. Add necessary columns to profiles table safely
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS daily_xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS daily_xp_date DATE DEFAULT CURRENT_DATE;

-- 2. Create the Trigger Function
CREATE OR REPLACE FUNCTION public.trg_update_daily_xp()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger if XP actually increased (to prevent tracking negative XP penalties or neutral updates)
  IF NEW.xp > OLD.xp THEN
    IF NEW.daily_xp_date IS NULL OR NEW.daily_xp_date < CURRENT_DATE THEN
      -- It's a new day! Reset daily_xp to the newly earned amount
      NEW.daily_xp := (NEW.xp - OLD.xp);
      NEW.daily_xp_date := CURRENT_DATE;
    ELSE
      -- Same day, accumulate
      NEW.daily_xp := COALESCE(OLD.daily_xp, 0) + (NEW.xp - OLD.xp);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Attach the Trigger
DROP TRIGGER IF EXISTS trg_profiles_daily_xp ON public.profiles;

CREATE TRIGGER trg_profiles_daily_xp
BEFORE UPDATE ON public.profiles
FOR EACH ROW
WHEN (NEW.xp > OLD.xp)
EXECUTE FUNCTION public.trg_update_daily_xp();

-- Optional: Reset script to run via cron if needed, though the trigger is lazy and resets on demand
-- UPDATE profiles SET daily_xp = 0, daily_xp_date = CURRENT_DATE WHERE daily_xp_date < CURRENT_DATE;
