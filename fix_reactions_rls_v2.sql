-- Fix reactions disappearing on refresh (Version 2)
-- Since private_messages is a view, we only need to apply the trigger and policy to the underlying 'messages' table.

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

-- 3. Create RLS Policy for messages to allow updating reactions
DROP POLICY IF EXISTS "Anyone can update messages for reactions" ON public.messages;
CREATE POLICY "Anyone can update messages for reactions"
ON public.messages FOR UPDATE
TO authenticated
USING (true);
