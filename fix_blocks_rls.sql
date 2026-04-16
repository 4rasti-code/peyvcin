-- 1. Enable RLS on the blocks table
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies if any (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own blocks" ON public.blocks;
DROP POLICY IF EXISTS "Users can manage their own blocks" ON public.blocks;

-- 3. Policy: Authenticated users can see blocks where they are the blocker or the blocked user
-- This is necessary so the app can filter out messages in both directions
CREATE POLICY "Users can view their own blocks" 
ON public.blocks 
FOR SELECT 
TO authenticated 
USING (auth.uid() = blocker_id OR auth.uid() = blocked_id);

-- 4. Policy: Users can block other users (Insert)
CREATE POLICY "Users can insert their own blocks" 
ON public.blocks 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = blocker_id);

-- 5. Policy: Users can unblock other users (Delete)
CREATE POLICY "Users can delete their own blocks" 
ON public.blocks 
FOR DELETE 
TO authenticated 
USING (auth.uid() = blocker_id);
