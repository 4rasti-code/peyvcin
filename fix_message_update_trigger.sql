CREATE OR REPLACE FUNCTION public.protect_message_updates()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.content IS DISTINCT FROM OLD.content THEN
     IF NEW.content = 'ئەڤ نامەیە ژێبر بۆ' OR NEW.content = '🚫 ئەڤ نامەیە ژێبر بۆ' THEN
         -- Allow deletion text
     ELSE
         RAISE EXCEPTION 'You cannot modify message content.';
     END IF;
  END IF;
  IF NEW.user_id IS DISTINCT FROM OLD.user_id OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
     RAISE EXCEPTION 'You cannot modify message metadata.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

UPDATE storage.buckets SET public = true WHERE id = 'chat_images';
