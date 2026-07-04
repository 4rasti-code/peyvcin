-- Update Daily Rewards (8 Items)
DROP FUNCTION IF EXISTS public.claim_daily_reward();
DROP FUNCTION IF EXISTS public.claim_daily_reward(DATE);

CREATE OR REPLACE FUNCTION public.claim_daily_reward()
RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_last_claim TIMESTAMP WITH TIME ZONE;
  v_streak INTEGER;
  v_now TIMESTAMP WITH TIME ZONE := NOW();
  v_today_date DATE := (v_now AT TIME ZONE 'Asia/Baghdad')::DATE;
  v_last_claim_date DATE;
  v_diff INTEGER;
  
  -- Reward values
  v_reward_fils INTEGER := 0;
  v_reward_derhem INTEGER := 0;
  v_reward_dinar INTEGER := 0;
  v_reward_magnets INTEGER := 0;
  v_reward_hints INTEGER := 0;
  v_reward_skips INTEGER := 0;
  v_reward_spin_tickets INTEGER := 0;
  v_reward_mystery_boxes INTEGER := 0;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'Unauthorized');
  END IF;

  SELECT last_reward_claimed_at, reward_streak 
  INTO v_last_claim, v_streak
  FROM public.profiles 
  WHERE id = v_user_id
  FOR UPDATE;

  v_streak := COALESCE(v_streak, 0);
  
  IF v_last_claim IS NOT NULL THEN
    v_last_claim_date := (v_last_claim AT TIME ZONE 'Asia/Baghdad')::DATE;
    
    IF v_last_claim_date = v_today_date THEN
      RETURN json_build_object('success', false, 'message', 'Already claimed today');
    END IF;
    
    v_diff := v_today_date - v_last_claim_date;
    
    IF v_diff = 1 THEN
      v_streak := (v_streak % 7) + 1;
    ELSE
      v_streak := 1;
    END IF;
  ELSE
    v_streak := 1;
  END IF;

  -- New 8-item Rewards Schedule
  IF v_streak = 1 THEN v_reward_fils := 100;
  ELSIF v_streak = 2 THEN v_reward_hints := 1;
  ELSIF v_streak = 3 THEN v_reward_spin_tickets := 1;
  ELSIF v_streak = 4 THEN v_reward_derhem := 3;
  ELSIF v_streak = 5 THEN v_reward_magnets := 1;
  ELSIF v_streak = 6 THEN v_reward_mystery_boxes := 1;
  ELSIF v_streak = 7 THEN v_reward_skips := 1; v_reward_dinar := 1; v_reward_fils := 200;
  END IF;

  UPDATE public.profiles
  SET 
    reward_streak = v_streak,
    last_reward_claimed_at = v_now,
    fils = COALESCE(fils, 0) + v_reward_fils,
    derhem = COALESCE(derhem, 0) + v_reward_derhem,
    dinar = COALESCE(dinar, 0) + v_reward_dinar,
    magnets = COALESCE(magnets, 0) + v_reward_magnets,
    hints = COALESCE(hints, 0) + v_reward_hints,
    skips = COALESCE(skips, 0) + v_reward_skips,
    spin_tickets = COALESCE(spin_tickets, 0) + v_reward_spin_tickets,
    mystery_boxes_count = COALESCE(mystery_boxes_count, 0) + v_reward_mystery_boxes
  WHERE id = v_user_id;

  RETURN json_build_object(
    'success', true, 
    'streak', v_streak,
    'rewards', json_build_object(
      'fils', v_reward_fils,
      'derhem', v_reward_derhem,
      'dinar', v_reward_dinar,
      'magnets', v_reward_magnets,
      'hints', v_reward_hints,
      'skips', v_reward_skips,
      'spinTicketCount', v_reward_spin_tickets,
      'mystery_boxes_count', v_reward_mystery_boxes
    )
  );
END;
$$ LANGUAGE plpgsql;
