-- MASTER SYNC SCRIPT FOR PEYVCİN
-- Run this in the Supabase SQL Editor to fix 400 Bad Request errors.

-- 1. FIX PROFILES TABLE
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS mamak_level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS nickname TEXT DEFAULT 'یاریکەر',
ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT 'default',
ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS country_code TEXT DEFAULT 'KD',
ADD COLUMN IF NOT EXISTS is_kurdistan BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 2. CREATE GLOBAL CHAT TABLE
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_nickname TEXT DEFAULT 'یاریکەر',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. CREATE PRIVATE MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.private_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. CREATE FRIENDSHIPS TABLE
CREATE TABLE IF NOT EXISTS public.friendships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    friend_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending', -- 'pending', 'accepted'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. CREATE BLOCKS TABLE
CREATE TABLE IF NOT EXISTS public.blocks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    blocker_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    blocked_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. ENABLE ROW LEVEL SECURITY (RLS) FOR SAFETY
-- Note: These are basic policies. You can refine them in the Supabase UI.
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.private_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read and write
DO $$ 
BEGIN
    -- Global Messages
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all authenticated to read messages') THEN
        CREATE POLICY "Allow all authenticated to read messages" ON public.messages FOR SELECT TO authenticated USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all authenticated to insert messages') THEN
        CREATE POLICY "Allow all authenticated to insert messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Private Messages
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow users to read their own DMs') THEN
        CREATE POLICY "Allow users to read their own DMs" ON public.private_messages FOR SELECT TO authenticated USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow users to send DMs') THEN
        CREATE POLICY "Allow users to send DMs" ON public.private_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);
    END IF;
END $$;
