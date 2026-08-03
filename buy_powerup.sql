CREATE OR REPLACE FUNCTION public.buy_powerup(
  p_item_id TEXT,
  p_currency_used TEXT,
  p_price INTEGER
) RETURNS json AS $$
DECLARE
  v_curr_balance INTEGER;
BEGIN
  -- 1. Security Check
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Must be logged in to purchase.';
  END IF;

  -- 2. Get Current Balance
  SELECT 
    CASE 
      WHEN p_currency_used = 'fils' THEN fils
      WHEN p_currency_used = 'derhem' THEN derhem
      WHEN p_currency_used = 'dinar' THEN dinar
      ELSE 0
    END
  INTO v_curr_balance
  FROM profiles WHERE id = auth.uid();

  -- 3. Balance Check
  IF v_curr_balance < p_price THEN
    RAISE EXCEPTION 'Insufficient balance.';
  END IF;

  -- 4. Process Purchase Logic for Powerups
  UPDATE profiles 
  SET 
    fils = CASE WHEN p_currency_used = 'fils' THEN fils - p_price ELSE fils END,
    derhem = CASE WHEN p_currency_used = 'derhem' THEN derhem - p_price ELSE derhem END,
    dinar = CASE WHEN p_currency_used = 'dinar' THEN dinar - p_price ELSE dinar END,
    magnets = CASE WHEN p_item_id = 'attractor_field' THEN magnets + 1 ELSE magnets END,
    hints = CASE WHEN p_item_id = 'hint_pack' THEN hints + 1 ELSE hints END,
    skips = CASE WHEN p_item_id = 'full_skip' THEN skips + 1 ELSE skips END,
    updated_at = NOW()
  WHERE id = auth.uid();

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
