-- Grant full permissions to authenticated and anon roles for the player_stats table
GRANT ALL ON TABLE public.player_stats TO anon;
GRANT ALL ON TABLE public.player_stats TO authenticated;
GRANT ALL ON TABLE public.player_stats TO service_role;

-- Ensure RLS is enabled
ALTER TABLE public.player_stats ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies to avoid conflicts
DROP POLICY IF EXISTS "Player stats are viewable by everyone" ON public.player_stats;
DROP POLICY IF EXISTS "Users can update own player stats" ON public.player_stats;
DROP POLICY IF EXISTS "Users can insert own player stats" ON public.player_stats;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.player_stats;

-- Create robust policies
CREATE POLICY "Enable read access for all users" ON public.player_stats
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.player_stats
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for users based on user_id" ON public.player_stats
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Enable delete for users based on user_id" ON public.player_stats
  FOR DELETE USING (auth.uid() = user_id);
