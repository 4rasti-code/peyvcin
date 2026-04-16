-- 1. ADD COLUMNS TO messages TABLE
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS receiver_id UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE;

-- 2. UPDATE RLS POLICIES FOR messages
-- First, remove old policies
DROP POLICY IF EXISTS "Messages are viewable by everyone" ON public.messages;
DROP POLICY IF EXISTS "Auth users can insert messages" ON public.messages;
DROP POLICY IF EXISTS "Allow all authenticated to read messages" ON public.messages;
DROP POLICY IF EXISTS "Allow all authenticated to insert messages" ON public.messages;
DROP POLICY IF EXISTS "Users can view relevant messages" ON public.messages;
DROP POLICY IF EXISTS "Users can insert own messages" ON public.messages;

-- NEW POLICY: Allow reading Global messages (receiver_id is NULL) OR private messages where user is sender or receiver
CREATE POLICY "Users can view relevant messages" ON public.messages
FOR SELECT USING (
  (receiver_id IS NULL) OR 
  (auth.uid() = user_id) OR 
  (auth.uid() = receiver_id)
);

-- NEW POLICY: Allow authenticated users to insert their own messages
CREATE POLICY "Users can insert own messages" ON public.messages
FOR INSERT WITH CHECK (
  auth.uid() = user_id
);

-- NEW POLICY: Allow receivers to mark messages as read
CREATE POLICY "Users can update own received messages" ON public.messages
FOR UPDATE USING (
  auth.uid() = receiver_id
) WITH CHECK (
  auth.uid() = receiver_id
);

-- 3. MIGRATE DATA FROM private_messages TO messages
-- We map sender_id -> user_id and recipient_id -> receiver_id
-- We also preserve reactions, reply info, and read status
INSERT INTO public.messages (
    content, 
    created_at, 
    user_id, 
    receiver_id, 
    is_read, 
    reply_to_id, 
    reply_to_text, 
    reactions
)
SELECT 
    COALESCE(content, text), 
    created_at, 
    sender_id, 
    recipient_id, 
    is_read, 
    NULL, -- reply_to_id (mapping logic might be needed if IDs change, but for now we set NULL or attempt match)
    NULL, -- reply_to_text
    reactions
FROM public.private_messages;

-- 4. ENABLE REALTIME FOR messages (Important for UI updates)
-- Checking if table is already in publication
-- ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- 5. VERIFY INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_receiver_pair ON public.messages(user_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON public.messages(is_read) WHERE receiver_id IS NOT NULL;
