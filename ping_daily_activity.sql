-- ========================================================
-- Function: ping_daily_activity
-- Purpose: Safely update daily streak and activity when
--          the user logs in or opens the app.
--          Does NOT interfere with XP or match logic.
-- ========================================================

CREATE OR REPLACE FUNCTION public.ping_daily_activity()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_last_streak_at TIMESTAMP WITH TIME ZONE;
  v_daily_streak INTEGER;
  v_today DATE := CURRENT_DATE;
  v_total_active_days INTEGER;
  v_last_active_date DATE;
  v_updated BOOLEAN := FALSE;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Not authenticated');
  END IF;

  -- Lock row to prevent race conditions during rapid loads
  SELECT last_streak_at, daily_streak, total_active_days, last_active_date 
  INTO v_last_streak_at, v_daily_streak, v_total_active_days, v_last_active_date 
  FROM public.profiles 
  WHERE id = v_user_id
  FOR UPDATE;

  -- 1. Daily Retention Logic
  IF v_last_active_date IS NULL OR v_last_active_date < v_today THEN
    v_total_active_days := COALESCE(v_total_active_days, 0) + 1;
    v_last_active_date := v_today;
    v_updated := TRUE;
  END IF;

  -- 2. Daily Streak Logic (with 48-hour Grace Period)
  IF v_last_streak_at IS NULL THEN
    v_daily_streak := 1;
    v_updated := TRUE;
  ELSIF v_last_streak_at::DATE = v_today THEN
    -- Already pinged today, do nothing. (Ensures multiple pings in 24h count as 1)
    v_daily_streak := COALESCE(v_daily_streak, 1);
  ELSIF v_last_streak_at::DATE = v_today - INTERVAL '1 day' THEN
    -- Perfect continuation
    v_daily_streak := COALESCE(v_daily_streak, 0) + 1;
    v_updated := TRUE;
  ELSIF v_last_streak_at::DATE = v_today - INTERVAL '2 days' THEN
    -- Grace period! Missed yesterday but came today. Save streak!
    v_daily_streak := COALESCE(v_daily_streak, 0) + 1;
    v_updated := TRUE;
  ELSE
    -- Missed more than 1 day. Reset.
    v_daily_streak := 1;
    v_updated := TRUE;
  END IF;

  IF v_updated THEN
    UPDATE public.profiles
    SET 
      daily_streak = v_daily_streak,
      last_streak_at = NOW(),
      total_active_days = v_total_active_days,
      last_active_date = v_last_active_date,
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'daily_streak', v_daily_streak,
    'total_active_days', v_total_active_days,
    'updated', v_updated,
    'message', CASE WHEN v_updated THEN 'Streak updated successfully' ELSE 'Already active today' END
  );
END;
$$;
