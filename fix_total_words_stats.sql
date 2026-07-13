-- Fix for longest_word_length and fastest_solve_ms not being updated
-- 1. Drop old functions
DROP FUNCTION IF EXISTS public.sync_profile_progression(integer,integer,integer,integer,integer,text[],text,integer,boolean,integer,boolean,boolean,boolean,boolean);
DROP FUNCTION IF EXISTS public.sync_profile_progression(integer,integer,integer,integer,integer,text[],text,integer,boolean,integer,boolean,boolean,boolean,boolean,integer,integer);

-- 2. Create the updated RPC function
CREATE OR REPLACE FUNCTION public.sync_profile_progression(
  p_xp_to_add INTEGER,
  p_fils_to_add INTEGER,
  p_derhem_to_add INTEGER,
  p_dinar_to_add INTEGER,
  p_level INTEGER, -- Now ignored in favor of server-side calculation
  p_solved_words TEXT[],
  p_mode TEXT,
  p_score INTEGER,
  p_is_win BOOLEAN DEFAULT TRUE,
  p_attempts INTEGER DEFAULT 0,
  p_is_flawless BOOLEAN DEFAULT FALSE,
  p_is_secret_win BOOLEAN DEFAULT FALSE,
  p_is_riddle_no_skip BOOLEAN DEFAULT FALSE,
  p_is_pvp_flawless BOOLEAN DEFAULT FALSE,
  p_word_length INTEGER DEFAULT 0,
  p_solve_time_ms INTEGER DEFAULT 0, p_words_found INTEGER DEFAULT 1
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_old_streak INTEGER;
  v_new_streak INTEGER;
  v_max_streak INTEGER;
  v_distribution JSONB;
  v_attempts_key TEXT;
  v_new_xp INTEGER;
  v_new_level INTEGER;
  v_daily_streak INTEGER;
  v_today DATE;
  v_last_active DATE;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  v_today := CURRENT_DATE;

  -- 1. Daily Retention Logic
  SELECT last_active_date INTO v_last_active FROM public.profiles WHERE id = v_user_id;
  IF v_last_active IS NULL OR v_last_active < v_today THEN
    UPDATE public.profiles 
    SET 
        total_active_days = COALESCE(total_active_days, 0) + 1,
        last_active_date = v_today
    WHERE id = v_user_id;
  END IF;

  -- 2. Get current stats
  SELECT current_streak, max_streak, guess_distribution, xp
  INTO v_old_streak, v_max_streak, v_distribution, v_new_xp
  FROM public.profiles
  WHERE id = v_user_id;

  -- 3. Update XP and calculate NEW level server-side
  v_new_xp := COALESCE(v_new_xp, 0) + p_xp_to_add;
  v_new_level := calculate_rpg_level(v_new_xp);

  -- 4. Calculate streaks and distribution
  IF p_is_win THEN
    v_new_streak := COALESCE(v_old_streak, 0) + 1;
    IF v_new_streak > COALESCE(v_max_streak, 0) THEN
      v_max_streak := v_new_streak;
    END IF;

    IF p_attempts > 0 AND p_attempts <= 6 THEN
      v_attempts_key := p_attempts::TEXT;
      v_distribution := jsonb_set(
        COALESCE(v_distribution, '{"1":0,"2":0,"3":0,"4":0,"5":0,"6":0}'::jsonb), 
        ARRAY[v_attempts_key], 
        (COALESCE((v_distribution->>v_attempts_key)::INTEGER, 0) + 1)::TEXT::jsonb
      );
    END IF;
  ELSE
    v_new_streak := 0;
  END IF;

  -- 5. Update profile
  UPDATE public.profiles
  SET 
    xp = v_new_xp,
    fils = fils + p_fils_to_add,
    derhem = derhem + p_derhem_to_add,
    dinar = dinar + p_dinar_to_add,
    level = v_new_level, -- Server-side source of truth
    solved_words = p_solved_words,
    games_played = COALESCE(games_played, 0) + 1,
    games_won = CASE WHEN p_is_win THEN COALESCE(games_won, 0) + 1 ELSE COALESCE(games_won, 0) END,
    total_words_found = CASE WHEN p_is_win THEN COALESCE(total_words_found, 0) + p_words_found ELSE total_words_found END,
    current_streak = v_new_streak,
    max_streak = v_max_streak,
    guess_distribution = v_distribution,
    
    flawless_wins = CASE WHEN p_is_flawless THEN COALESCE(flawless_wins, 0) + 1 ELSE flawless_wins END,
    secret_wins = CASE WHEN p_is_secret_win THEN COALESCE(secret_wins, 0) + 1 ELSE secret_wins END,
    riddles_no_skip = CASE WHEN p_is_riddle_no_skip THEN COALESCE(riddles_no_skip, 0) + 1 ELSE riddles_no_skip END,
    pvp_flawless_wins = CASE WHEN p_is_pvp_flawless THEN COALESCE(pvp_flawless_wins, 0) + 1 ELSE pvp_flawless_wins END,
    pvp_wins = CASE WHEN (p_mode = 'battle' AND p_is_win) THEN COALESCE(pvp_wins, 0) + 1 ELSE pvp_wins END,
    
    mode_play_counts = jsonb_set(
        COALESCE(mode_play_counts, '{"classic":0, "battle":0, "mamak":0, "hard_words":0, "word_fever":0, "secret_word":0}'::jsonb),
        ARRAY[p_mode],
        (COALESCE((mode_play_counts->>p_mode)::int, 0) + 1)::text::jsonb
    ),
    
    -- Fix for longest word and fastest solve
    longest_word_length = CASE WHEN p_is_win THEN GREATEST(COALESCE(longest_word_length, 0), p_word_length) ELSE longest_word_length END,
    fastest_solve_ms = CASE 
        WHEN p_is_win AND p_solve_time_ms > 0 AND (COALESCE(fastest_solve_ms, 0) = 0 OR p_solve_time_ms < fastest_solve_ms) 
        THEN p_solve_time_ms 
        ELSE fastest_solve_ms 
    END,
    
    updated_at = NOW()
  WHERE id = v_user_id
  RETURNING daily_streak INTO v_daily_streak;

  RETURN jsonb_build_object(
    'success', true,
    'new_xp', v_new_xp,
    'new_level', v_new_level,
    'award_xp', p_xp_to_add,
    'daily_streak', v_daily_streak
  );
END;
$$;

-- 3. Reset buggy longest word lengths
UPDATE public.profiles SET longest_word_length = 0 WHERE longest_word_length > 8;
