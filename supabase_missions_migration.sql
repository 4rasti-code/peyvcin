-- 1. Add Inventory Column to Profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS inventory JSONB DEFAULT '{"badges": []}';

-- 2. Create Daily Missions Table
CREATE TABLE IF NOT EXISTS public.daily_missions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    mission_type TEXT NOT NULL, -- 'games_played', 'xp_earned', 'login_streak'
    progress INTEGER DEFAULT 0,
    target_goal INTEGER NOT NULL,
    is_claimed BOOLEAN DEFAULT false,
    claimed_at TIMESTAMP WITH TIME ZONE,
    last_reset DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, mission_type)
);

-- 3. Enable RLS
ALTER TABLE public.daily_missions ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
CREATE POLICY "Users can view their own missions" 
ON public.daily_missions FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own missions" 
ON public.daily_missions FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own missions" 
ON public.daily_missions FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- 5. Helper Function for Reset Logic (Optional but recommended)
-- This ensures missions are initialized for a user if they don't exist.
-- We will mostly handle initialization on the client side for Phase 1.
