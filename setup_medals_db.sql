-- Adds the claimed_medals column to profiles table if it doesn't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS claimed_medals JSONB DEFAULT '[]'::jsonb;

-- Creates an RPC to safely update claimed medals (POST request, bypasses AdBlockers)
CREATE OR REPLACE FUNCTION public.claim_medal(p_medal_id text, p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_medals jsonb;
BEGIN
  -- Get current medals array
  SELECT claimed_medals INTO current_medals FROM public.profiles WHERE id = p_user_id;
  
  -- Fallback if null
  IF current_medals IS NULL THEN
    current_medals := '[]'::jsonb;
  END IF;

  -- Append the new medal ID if it doesn't already exist
  IF NOT (current_medals @> to_jsonb(p_medal_id)) THEN
    UPDATE public.profiles
    SET claimed_medals = current_medals || to_jsonb(p_medal_id)
    WHERE id = p_user_id;
  END IF;
END;
$$;
