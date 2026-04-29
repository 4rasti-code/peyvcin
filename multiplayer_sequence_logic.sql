-- Optimized Multiplayer Sequence Logic
-- Automatically tags 5-letter words
UPDATE public.words 
SET mode_tags = array_append(mode_tags, 'multiplayer')
WHERE char_length(word) = 5 AND NOT ('multiplayer' = ANY(mode_tags));

-- Self-contained sequenced word fetcher
CREATE OR REPLACE FUNCTION public.get_multiplayer_words_sequenced()
RETURNS SETOF public.words AS $$
DECLARE
  v_total_multi_words INTEGER;
  v_match_count INTEGER;
  v_offset INTEGER;
BEGIN
  -- 1. Get total multiplayer words available
  SELECT count(*) INTO v_total_multi_words 
  FROM public.words 
  WHERE 'multiplayer' = ANY(mode_tags);
  
  -- 2. Get total matches created to date to determine the sequence point
  SELECT count(*) INTO v_match_count 
  FROM public.online_matches;
  
  IF v_total_multi_words = 0 THEN RETURN; END IF;

  -- 3. Calculate offset (assuming 5 words per match)
  v_offset := (v_match_count * 5) % v_total_multi_words;

  -- 4. Return words in stable order (by ID)
  RETURN QUERY
  SELECT *
  FROM public.words
  WHERE 'multiplayer' = ANY(mode_tags)
  ORDER BY id ASC
  LIMIT 5
  OFFSET v_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
