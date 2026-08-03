CREATE OR REPLACE FUNCTION public.buy_emoji_collection(
  p_item_id TEXT,
  p_currency_used TEXT,
  p_price INTEGER
) RETURNS json AS $$
DECLARE
  v_curr_balance INTEGER;
  v_owned_emojis TEXT[];
BEGIN
  -- 1. Security Check
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Must be logged in to purchase.';
  END IF;

  -- 2. Get Current Balance and Inventory
  SELECT 
    CASE 
      WHEN p_currency_used = 'fils' THEN fils
      WHEN p_currency_used = 'derhem' THEN derhem
      WHEN p_currency_used = 'dinar' THEN dinar
      ELSE 0
    END,
    owned_emojis
  INTO v_curr_balance, v_owned_emojis
  FROM profiles WHERE id = auth.uid();

  -- Handle NULL array
  v_owned_emojis := COALESCE(v_owned_emojis, ARRAY['default']::TEXT[]);

  -- 3. Balance & Ownership Check
  IF v_curr_balance < p_price THEN
    RAISE EXCEPTION 'Insufficient balance.';
  END IF;

  IF p_item_id = ANY(v_owned_emojis) THEN
    RAISE EXCEPTION 'Emoji collection already owned.';
  END IF;

  -- 4. Process Purchase Logic
  UPDATE profiles
  SET
    fils = CASE WHEN p_currency_used = 'fils' THEN fils - p_price ELSE fils END,
    derhem = CASE WHEN p_currency_used = 'derhem' THEN derhem - p_price ELSE derhem END,
    dinar = CASE WHEN p_currency_used = 'dinar' THEN dinar - p_price ELSE dinar END,
    owned_emojis = v_owned_emojis || p_item_id,
    updated_at = NOW()
  WHERE id = auth.uid();

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
