-- SQL Function to safely delete a conversation between two users
-- Bypasses Row Level Security (RLS) so that both users' messages are deleted.
CREATE OR REPLACE FUNCTION delete_chat_history(user1_id uuid, user2_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM messages 
    WHERE (user_id = user1_id AND receiver_id = user2_id)
       OR (user_id = user2_id AND receiver_id = user1_id);
END;
$$;
