-- 🚀 MULTIPLAYER DESYNC FIX (The Single Source of Truth)
-- Run this entire script in your Supabase SQL Editor.

CREATE OR REPLACE FUNCTION submit_match_guess(
    p_match_id UUID,
    p_user_id UUID,
    p_expected_round INTEGER,
    p_action TEXT, -- 'GUESS', 'WIN', 'FAIL'
    p_colors JSONB DEFAULT '[]'::jsonb
) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_match online_matches%ROWTYPE;
    v_is_p1 BOOLEAN;
    v_new_p1_score INTEGER;
    v_new_p2_score INTEGER;
    v_new_index INTEGER;
    v_total_words INTEGER;
    v_score_diff INTEGER;
    v_is_match_end BOOLEAN;
    v_other_is_done BOOLEAN;
BEGIN
    -- 1. Lock the row to prevent the Lost Update Anomaly (The Race Condition fix)
    SELECT * INTO v_match 
    FROM online_matches 
    WHERE id = p_match_id 
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN;
    END IF;

    -- 2. Validate player identity
    v_is_p1 := (v_match.player1_id = p_user_id);
    IF NOT v_is_p1 AND v_match.player2_id != p_user_id THEN
        RETURN; 
    END IF;

    -- 3. Stale State Prevention: If the round has already advanced, discard late submissions!
    IF COALESCE(v_match.current_word_index, 0) != p_expected_round THEN
        RETURN; 
    END IF;

    IF v_match.status != 'playing' THEN
        RETURN;
    END IF;

    -- Load current state
    v_new_p1_score := COALESCE(v_match.p1_score, 0);
    v_new_p2_score := COALESCE(v_match.p2_score, 0);
    v_new_index := COALESCE(v_match.current_word_index, 0);
    v_total_words := COALESCE(cardinality(v_match.words), 5);

    -- ==========================================
    -- ACTION: NORMAL GUESS
    -- ==========================================
    IF p_action = 'GUESS' THEN
        IF v_is_p1 THEN
            UPDATE online_matches 
            SET p1_colors = COALESCE(p1_colors, '[]'::jsonb) || jsonb_build_array(p_colors) 
            WHERE id = p_match_id;
        ELSE
            UPDATE online_matches 
            SET p2_colors = COALESCE(p2_colors, '[]'::jsonb) || jsonb_build_array(p_colors) 
            WHERE id = p_match_id;
        END IF;

    -- ==========================================
    -- ACTION: WIN ROUND
    -- ==========================================
    ELSIF p_action = 'WIN' THEN
        IF v_is_p1 THEN
            v_new_p1_score := v_new_p1_score + 1;
        ELSE
            v_new_p2_score := v_new_p2_score + 1;
        END IF;

        v_score_diff := abs(v_new_p1_score - v_new_p2_score);
        v_is_match_end := (v_score_diff >= 2) OR (v_new_index + 1 >= v_total_words);

        UPDATE online_matches SET 
            p1_score = v_new_p1_score,
            p2_score = v_new_p2_score,
            p1_failed = false,
            p2_failed = false,
            p1_colors = '[]'::jsonb,
            p2_colors = '[]'::jsonb,
            status = CASE WHEN v_is_match_end THEN 'finished' ELSE 'playing' END,
            current_word_index = CASE WHEN v_is_match_end THEN v_new_index ELSE v_new_index + 1 END
        WHERE id = p_match_id;

    -- ==========================================
    -- ACTION: FAIL ROUND
    -- ==========================================
    ELSIF p_action = 'FAIL' THEN
        -- Check if the OTHER player has already failed
        IF v_is_p1 THEN
            v_other_is_done := COALESCE(v_match.p2_failed, false);
        ELSE
            v_other_is_done := COALESCE(v_match.p1_failed, false);
        END IF;

        IF v_other_is_done THEN
            -- Both players failed -> It's a draw, advance the round
            v_score_diff := abs(v_new_p1_score - v_new_p2_score);
            v_is_match_end := (v_score_diff >= 2) OR (v_new_index + 1 >= v_total_words);

            UPDATE online_matches SET 
                p1_failed = false,
                p2_failed = false,
                p1_colors = '[]'::jsonb,
                p2_colors = '[]'::jsonb,
                status = CASE WHEN v_is_match_end THEN 'finished' ELSE 'playing' END,
                current_word_index = CASE WHEN v_is_match_end THEN v_new_index ELSE v_new_index + 1 END
            WHERE id = p_match_id;
        ELSE
            -- Only this player failed, just update their failure state
            IF v_is_p1 THEN
                UPDATE online_matches SET 
                    p1_failed = true, 
                    p1_colors = COALESCE(p1_colors, '[]'::jsonb) || jsonb_build_array(p_colors) 
                WHERE id = p_match_id;
            ELSE
                UPDATE online_matches SET 
                    p2_failed = true, 
                    p2_colors = COALESCE(p2_colors, '[]'::jsonb) || jsonb_build_array(p_colors) 
                WHERE id = p_match_id;
            END IF;
        END IF;

    -- ==========================================
    -- ACTION: TIMEOUT (Force Opponent to Fail)
    -- ==========================================
    ELSIF p_action = 'TIMEOUT' THEN
        -- Only a player who has ALREADY failed can force a timeout on the OTHER player
        IF v_is_p1 AND NOT COALESCE(v_match.p1_failed, false) THEN
            RETURN;
        END IF;
        IF NOT v_is_p1 AND NOT COALESCE(v_match.p2_failed, false) THEN
            RETURN;
        END IF;

        -- Both players have now effectively failed -> It's a draw, advance the round
        v_score_diff := abs(v_new_p1_score - v_new_p2_score);
        v_is_match_end := (v_score_diff >= 2) OR (v_new_index + 1 >= v_total_words);

        UPDATE online_matches SET 
            p1_failed = false,
            p2_failed = false,
            p1_colors = '[]'::jsonb,
            p2_colors = '[]'::jsonb,
            status = CASE WHEN v_is_match_end THEN 'finished' ELSE 'playing' END,
            current_word_index = CASE WHEN v_is_match_end THEN v_new_index ELSE v_new_index + 1 END
        WHERE id = p_match_id;
        
    END IF;
END;
$$;
