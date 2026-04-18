-- Atomic Matchmaking Queue for Peyvçîn 1v1
-- Prevents race conditions when multiple players search simultaneously

CREATE OR REPLACE FUNCTION join_matchmaking(p_user_id UUID)
RETURNS UUID AS $$
DECLARE
    v_match_id UUID;
BEGIN
    -- 1. Try to find and lock an available waiting match atomically.
    -- FOR UPDATE SKIP LOCKED guarantees that no two concurrent players grab the same room.
    SELECT id INTO v_match_id
    FROM online_matches
    WHERE status = 'waiting' 
      AND player1_id != p_user_id
      AND player2_id IS NULL
    FOR UPDATE SKIP LOCKED
    LIMIT 1;

    -- 2. If a room was successfully locked
    IF v_match_id IS NOT NULL THEN
        -- Safely claim the match
        UPDATE online_matches
        SET player2_id = p_user_id,
            status = 'playing'
        WHERE id = v_match_id;

        -- Return the joined room ID to the client
        RETURN v_match_id;
    END IF;

    -- 3. Return NULL if no available room was found (Client should become Host)
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
