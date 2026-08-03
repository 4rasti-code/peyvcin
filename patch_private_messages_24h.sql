-- 1. Update the RPC function to only consider messages from the last 24 hours
CREATE OR REPLACE FUNCTION get_user_conversations(current_user_id UUID)
RETURNS TABLE(
    partner_id UUID,
    nickname TEXT,
    avatar_url TEXT,
    last_message TEXT,
    last_message_time TIMESTAMP WITH TIME ZONE,
    unread_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH UserMessages AS (
        SELECT 
            m.id,
            m.content,
            m.created_at,
            m.is_read,
            CASE 
                WHEN m.user_id = current_user_id THEN m.receiver_id
                ELSE m.user_id
            END AS partner
        FROM messages m
        WHERE (m.user_id = current_user_id OR m.receiver_id = current_user_id)
          AND m.receiver_id IS NOT NULL
          AND m.created_at > NOW() - INTERVAL '24 hours'
    ),
    LatestMessages AS (
        SELECT 
            partner,
            MAX(created_at) AS last_message_time
        FROM UserMessages
        GROUP BY partner
    ),
    UnreadCounts AS (
        SELECT 
            m.user_id AS partner,
            COUNT(*) AS unread_count
        FROM messages m
        WHERE m.receiver_id = current_user_id 
          AND m.is_read = FALSE
          AND m.created_at > NOW() - INTERVAL '24 hours'
        GROUP BY m.user_id
    )
    SELECT 
        lm.partner AS partner_id,
        p.nickname,
        p.avatar_url,
        m.content AS last_message,
        lm.last_message_time,
        COALESCE(uc.unread_count, 0) AS unread_count
    FROM LatestMessages lm
    JOIN profiles p ON p.id = lm.partner
    JOIN UserMessages m ON m.partner = lm.partner AND m.created_at = lm.last_message_time
    LEFT JOIN UnreadCounts uc ON uc.partner = lm.partner
    ORDER BY lm.last_message_time DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. (Optional) Run this to manually delete old private messages right now
DELETE FROM messages 
WHERE receiver_id IS NOT NULL 
AND created_at <= NOW() - INTERVAL '24 hours';

-- 3. (Optional) Create a cron job to automatically delete old private messages every hour
-- Note: Requires pg_cron extension to be enabled in Supabase.
-- 
-- SELECT cron.schedule(
--   'delete-old-private-messages',
--   '0 * * * *', -- Runs every hour at minute 0
--   $$
--     DELETE FROM messages 
--     WHERE receiver_id IS NOT NULL 
--     AND created_at <= NOW() - INTERVAL '24 hours';
--   $$
-- );
