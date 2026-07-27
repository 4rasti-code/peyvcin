-- Create invite_tracking table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.invite_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    strike_count INT DEFAULT 0,
    blocked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(sender_id, receiver_id)
);

-- IMPORTANT: Grant access to authenticated users
GRANT ALL ON TABLE public.invite_tracking TO authenticated;
GRANT ALL ON TABLE public.invite_tracking TO service_role;

-- Enable Row Level Security (RLS)
ALTER TABLE public.invite_tracking ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own tracking records" ON public.invite_tracking;
DROP POLICY IF EXISTS "Users can insert their own tracking records" ON public.invite_tracking;
DROP POLICY IF EXISTS "Users can update their own tracking records" ON public.invite_tracking;

-- Create policies
-- 1. Users can view records where they are the sender or receiver
CREATE POLICY "Users can view their own tracking records" 
ON public.invite_tracking FOR SELECT 
TO authenticated 
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- 2. Users can insert records where they are the sender
CREATE POLICY "Users can insert their own tracking records" 
ON public.invite_tracking FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = sender_id);

-- 3. Users can update records where they are the sender
CREATE POLICY "Users can update their own tracking records" 
ON public.invite_tracking FOR UPDATE 
TO authenticated 
USING (auth.uid() = sender_id);
