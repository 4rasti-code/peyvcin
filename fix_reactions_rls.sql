-- Fix reactions disappearing on refresh
-- This adds the necessary RLS policies and protection triggers so users can update reactions safely.

-- 1. Create a trigger to protect message content from being altered during reaction updates
CREATE OR REPLACE FUNCTION public.protect_message_updates()
RETURNS TRIGGER AS $$
BEGIN
  -- Block changing core message data
  IF NEW.content IS DISTINCT FROM OLD.content OR
     NEW.user_id IS DISTINCT FROM OLD.user_id OR
     NEW.created_at IS DISTINCT FROM OLD.created_at THEN
     RAISE EXCEPTION 'You cannot modify message content or metadata.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Apply trigger to public messages
DROP TRIGGER IF EXISTS tr_protect_messages ON public.messages;
CREATE TRIGGER tr_protect_messages
BEFORE UPDATE ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.protect_message_updates();

-- 3. Apply trigger to private messages
DROP TRIGGER IF EXISTS tr_protect_private_messages ON public.private_messages;
CREATE TRIGGER tr_protect_private_messages
BEFORE UPDATE ON public.private_messages
FOR EACH ROW
EXECUTE FUNCTION public.protect_message_updates();

-- 4. Create RLS Policy for public messages to allow updating reactions
DROP POLICY IF EXISTS "Anyone can update messages for reactions" ON public.messages;
CREATE POLICY "Anyone can update messages for reactions"
ON public.messages FOR UPDATE
TO authenticated
USING (true);

-- 5. Create RLS Policy for private messages to allow updating reactions
DROP POLICY IF EXISTS "Participants can update private messages for reactions" ON public.private_messages;
CREATE POLICY "Participants can update private messages for reactions"
ON public.private_messages FOR UPDATE
TO authenticated
USING (auth.uid() = user_id OR auth.uid() = receiver_id);
