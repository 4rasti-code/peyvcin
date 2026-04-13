-- ENABLE FULL REPLICA IDENTITY FOR REAL-TIME FILTERS TO WORK RELIABLY
ALTER TABLE public.private_messages REPLICA IDENTITY FULL;
ALTER TABLE public.friendships REPLICA IDENTITY FULL;

-- ENSURE REALTIME IS ACTIVE FOR THE TABLES
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'private_messages') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.private_messages;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'friendships') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.friendships;
  END IF;
END $$;
