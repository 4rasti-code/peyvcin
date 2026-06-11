-- 1. Create player_stats table if missing
CREATE TABLE IF NOT EXISTS public.player_stats (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  guess_distribution JSONB DEFAULT '{}'::JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable RLS and Policies for player_stats
ALTER TABLE public.player_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Player stats are viewable by everyone" ON public.player_stats;
CREATE POLICY "Player stats are viewable by everyone" ON public.player_stats FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own player stats" ON public.player_stats;
CREATE POLICY "Users can update own player stats" ON public.player_stats FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own player stats" ON public.player_stats;
CREATE POLICY "Users can insert own player stats" ON public.player_stats FOR INSERT WITH CHECK (auth.uid() = user_id);


-- 2. Add missing columns to profiles table for advanced stats
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS pvp_wins INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_words_found INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS longest_word_length INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fastest_solve_ms INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS flawless_wins INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_active_days INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fever_highscore INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS mode_play_counts JSONB DEFAULT '{}'::JSONB,
  ADD COLUMN IF NOT EXISTS words_without_hints INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS games_played INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS games_won INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS max_streak INTEGER DEFAULT 0;
