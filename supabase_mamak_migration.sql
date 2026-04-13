-- Migration: Multi-Mode Progression & Standardization
-- Created: 2026-04-11
-- Description: Supports linear progression levels and dynamic multipliers for all game modes.

-- 1. Add Progression Columns for All Modes
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS hard_words_level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS word_fever_level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS secret_word_level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS wins_towards_secret INTEGER DEFAULT 0;

-- Documentation comments
COMMENT ON COLUMN profiles.hard_words_level IS 'Linear progression for the Hard Words (Daily) mode.';
COMMENT ON COLUMN profiles.word_fever_level IS 'Linear progression for the Word Fever (Speed) mode.';
COMMENT ON COLUMN profiles.secret_word_level IS 'Linear progression for the Secret Word (Mystery) mode.';
COMMENT ON COLUMN profiles.wins_towards_secret IS 'Tracks wins in other modes to unlock Secret Word.';

-- 2. Refined RPC for Level Completion
-- Supports dynamic multipliers and individual progression tracking per mode in a single transaction.
CREATE OR REPLACE FUNCTION handle_level_completion(
  p_user_id UUID,
  p_reward_amount INTEGER,
  p_xp_amount INTEGER,
  p_game_mode TEXT DEFAULT 'classic',
  p_completed_level INTEGER DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  v_current_level INTEGER;
  v_multiplier NUMERIC;
  v_final_reward INTEGER;
BEGIN
  -- I. Determine Multiplier based on Game Mode
  -- These multipliers are applied to the base tile-calculation reward.
  v_multiplier := CASE 
    WHEN p_game_mode = 'hard_words' THEN 2.0
    WHEN p_game_mode = 'secret_word' THEN 2.5
    WHEN p_game_mode = 'mamak' THEN 1.5
    WHEN p_game_mode = 'word_fever' THEN 1.25
    ELSE 1.0
  END;

  -- II. Get current level for the specific mode to handle progression/replay logic
  v_current_level := CASE 
    WHEN p_game_mode = 'mamak' THEN (SELECT mamak_level FROM profiles WHERE id = p_user_id)
    WHEN p_game_mode = 'hard_words' THEN (SELECT hard_words_level FROM profiles WHERE id = p_user_id)
    WHEN p_game_mode = 'word_fever' THEN (SELECT word_fever_level FROM profiles WHERE id = p_user_id)
    WHEN p_game_mode = 'secret_word' THEN (SELECT secret_word_level FROM profiles WHERE id = p_user_id)
    ELSE (SELECT level FROM profiles WHERE id = p_user_id)
  END;

  -- III. Apply Multiplier and Check Replay
  v_final_reward := (p_reward_amount * v_multiplier)::INTEGER;

  -- Replay Logic: Grant only 20% of the calculated reward if replaying a lower level than current progression.
  IF p_completed_level IS NOT NULL AND p_completed_level < v_current_level THEN
    v_final_reward := (v_final_reward * 0.20)::INTEGER;
  END IF;

  -- IV. Atomic Update
  UPDATE profiles
  SET 
    fils = fils + v_final_reward,
    xp = xp + p_xp_amount,
    -- Increment the specific level column if the player just completed their current level.
    mamak_level = CASE 
      WHEN p_game_mode = 'mamak' AND p_completed_level = v_current_level THEN v_current_level + 1 
      ELSE mamak_level 
    END,
    hard_words_level = CASE 
      WHEN p_game_mode = 'hard_words' AND p_completed_level = v_current_level THEN v_current_level + 1 
      ELSE hard_words_level 
    END,
    word_fever_level = CASE 
      WHEN p_game_mode = 'word_fever' AND p_completed_level = v_current_level THEN v_current_level + 1 
      ELSE word_fever_level 
    END,
    secret_word_level = CASE 
      WHEN p_game_mode = 'secret_word' AND p_completed_level = v_current_level THEN v_current_level + 1 
      ELSE secret_word_level 
    END,
    updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- 3. Update Leaderboard View to show primary progression markers
DROP VIEW IF EXISTS leaderboard_view;
CREATE VIEW leaderboard_view AS
SELECT 
  id,
  nickname,
  avatar_url,
  city,
  level AS classic_level,
  mamak_level,
  hard_words_level,
  fils,
  xp
FROM profiles
WHERE nickname IS NOT NULL 
  AND nickname != ''
  AND nickname NOT ILIKE '%test%'
ORDER BY mamak_level DESC, hard_words_level DESC, fils DESC;
