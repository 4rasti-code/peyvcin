-- SQL Function to safely delete a conversation between two normal users
-- Bypasses Row Level Security (RLS) so that both users' messages are deleted.
CREATE OR REPLACE FUNCTION delete_chat_history(user1_id uuid, user2_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Do not delete ANYTHING if one of the users is a protected admin (Lunaaa21, Nawroz44, or Bot)
    -- This ensures both the admin's messages AND the user's replies to the admin remain safely in the DB.
    IF user1_id IN (
        'e2052ae5-e2c7-4a08-9ba2-c33bc85b19ca',
        'b082d89e-3daa-4067-9c20-506cd7b4994d',
        '9a813c24-b662-477d-a74a-6f822d17bbf1'
    ) OR user2_id IN (
        'e2052ae5-e2c7-4a08-9ba2-c33bc85b19ca',
        'b082d89e-3daa-4067-9c20-506cd7b4994d',
        '9a813c24-b662-477d-a74a-6f822d17bbf1'
    ) THEN
        RETURN;
    END IF;

    DELETE FROM messages 
    WHERE (user_id = user1_id AND receiver_id = user2_id)
       OR (user_id = user2_id AND receiver_id = user1_id);
END;
$$;
