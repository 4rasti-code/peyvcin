-- Update the status constraint for online_matches to allow private matches
ALTER TABLE public.online_matches DROP CONSTRAINT IF EXISTS online_matches_status_check;

ALTER TABLE public.online_matches ADD CONSTRAINT online_matches_status_check 
CHECK (status IN ('global_waiting', 'private_waiting', 'waiting', 'playing', 'finished', 'game_over'));
