-- Create the reported_messages table
CREATE TABLE IF NOT EXISTS public.reported_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id UUID NOT NULL,
    reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    status TEXT DEFAULT 'pending'
);

-- Set up RLS
ALTER TABLE public.reported_messages ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert reports
CREATE POLICY "Users can report messages" 
ON public.reported_messages 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = reporter_id);

-- Admins can view reports (if you have an admin role or specific policies, otherwise you can view them in the dashboard)
CREATE POLICY "Users can view their own reports" 
ON public.reported_messages 
FOR SELECT 
TO authenticated 
USING (auth.uid() = reporter_id);
