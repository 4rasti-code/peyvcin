-- FIX FOR MULTIPLAYER PRIVATE MATCH JOINING
-- The previous RLS policy prevented receivers from finding the match because they were not player1 or player2 yet.

DROP POLICY IF EXISTS "Participants can view their matches" ON online_matches;
CREATE POLICY "Participants can view their matches"
ON online_matches FOR SELECT
TO authenticated
USING (auth.uid() = player1_id OR auth.uid() = player2_id OR status IN ('waiting', 'private_waiting', 'global_waiting'));

DROP POLICY IF EXISTS "Participants can update their matches" ON online_matches;
CREATE POLICY "Participants can update their matches"
ON online_matches FOR UPDATE
TO authenticated
USING (auth.uid() = player1_id OR auth.uid() = player2_id OR (status IN ('waiting', 'private_waiting', 'global_waiting') AND player2_id IS NULL));
