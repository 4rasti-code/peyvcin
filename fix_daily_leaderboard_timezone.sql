-- Fix: Align Daily Leaderboard with Kurdistan Time (UTC+3)
-- Change the trigger to use 'Asia/Baghdad' timezone instead of UTC CURRENT_DATE

CREATE OR REPLACE FUNCTION public.trg_update_daily_xp()
RETURNS TRIGGER AS $$
DECLARE
  kurdistan_date DATE;
BEGIN
  -- Get current date in Kurdistan Time (Asia/Baghdad)
  kurdistan_date := (CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Baghdad')::DATE;

  -- Only trigger if XP actually increased
  IF NEW.xp > OLD.xp THEN
    IF NEW.daily_xp_date IS NULL OR NEW.daily_xp_date < kurdistan_date THEN
      -- It's a new day in Kurdistan! Reset daily_xp to the newly earned amount
      NEW.daily_xp := (NEW.xp - OLD.xp);
      NEW.daily_xp_date := kurdistan_date;
    ELSE
      -- Same day, accumulate
      NEW.daily_xp := COALESCE(OLD.daily_xp, 0) + (NEW.xp - OLD.xp);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
