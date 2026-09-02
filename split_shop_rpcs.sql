-- 1. buy_powerup
CREATE OR REPLACE FUNCTION public.buy_powerup(
  p_item_id TEXT,
  p_currency_used TEXT,
  p_price INTEGER
)
RETURNS JSON AS $$
DECLARE
  v_curr_balance INTEGER;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Must be logged in to purchase.';
  END IF;

  SELECT 
    CASE 
      WHEN p_currency_used = 'fils' THEN fils
      WHEN p_currency_used = 'derhem' THEN derhem
      WHEN p_currency_used = 'dinar' THEN dinar
      ELSE 0
    END
  INTO v_curr_balance
  FROM profiles WHERE id = auth.uid();

  IF v_curr_balance < p_price THEN
    RAISE EXCEPTION 'Insufficient balance.';
  END IF;

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

-- 2. buy_avatar
CREATE OR REPLACE FUNCTION public.buy_avatar(
  p_item_id TEXT,
  p_currency_used TEXT,
  p_price INTEGER
)
RETURNS JSON AS $$
DECLARE
  v_curr_balance INTEGER;
  v_inventory JSONB;
  v_owned_avatars JSONB;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Must be logged in to purchase.';
  END IF;

  SELECT 
    CASE 
      WHEN p_currency_used = 'fils' THEN fils
      WHEN p_currency_used = 'derhem' THEN derhem
      WHEN p_currency_used = 'dinar' THEN dinar
      ELSE 0
    END,
    inventory
  INTO v_curr_balance, v_inventory
  FROM profiles WHERE id = auth.uid();

  v_owned_avatars := COALESCE(v_inventory->'owned_avatars', '[]'::JSONB);

  IF v_curr_balance < p_price THEN
    RAISE EXCEPTION 'Insufficient balance.';
  END IF;

  IF v_owned_avatars ? p_item_id THEN
    RAISE EXCEPTION 'Item already owned.';
  END IF;
  
  UPDATE profiles
  SET
    fils = CASE WHEN p_currency_used = 'fils' THEN fils - p_price ELSE fils END,
    derhem = CASE WHEN p_currency_used = 'derhem' THEN derhem - p_price ELSE derhem END,
    dinar = CASE WHEN p_currency_used = 'dinar' THEN dinar - p_price ELSE dinar END,
    inventory = jsonb_set(COALESCE(inventory, '{}'::JSONB), '{owned_avatars}', v_owned_avatars || to_jsonb(p_item_id)),
    updated_at = NOW()
  WHERE id = auth.uid();

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. buy_name_style
CREATE OR REPLACE FUNCTION public.buy_name_style(
  p_item_id TEXT,
  p_currency_used TEXT,
  p_price INTEGER
)
RETURNS JSON AS $$
DECLARE
  v_curr_balance INTEGER;
  v_owned_name_styles TEXT[];
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Must be logged in to purchase.';
  END IF;

  SELECT 
    CASE 
      WHEN p_currency_used = 'fils' THEN fils
      WHEN p_currency_used = 'derhem' THEN derhem
      WHEN p_currency_used = 'dinar' THEN dinar
      ELSE 0
    END,
    owned_name_styles
  INTO v_curr_balance, v_owned_name_styles
  FROM profiles WHERE id = auth.uid();

  v_owned_name_styles := COALESCE(v_owned_name_styles, ARRAY['default']::TEXT[]);

  IF v_curr_balance < p_price THEN
    RAISE EXCEPTION 'Insufficient balance.';
  END IF;

  IF p_item_id = ANY(v_owned_name_styles) THEN
    RAISE EXCEPTION 'Name style already owned.';
  END IF;
  
  UPDATE profiles
  SET
    fils = CASE WHEN p_currency_used = 'fils' THEN fils - p_price ELSE fils END,
    derhem = CASE WHEN p_currency_used = 'derhem' THEN derhem - p_price ELSE derhem END,
    dinar = CASE WHEN p_currency_used = 'dinar' THEN dinar - p_price ELSE dinar END,
    owned_name_styles = v_owned_name_styles || p_item_id,
    updated_at = NOW()
  WHERE id = auth.uid();

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. buy_bundle
CREATE OR REPLACE FUNCTION public.buy_bundle(
  p_item_id TEXT,
  p_currency_used TEXT,
  p_price INTEGER
)
RETURNS JSON AS $$
DECLARE
  v_curr_balance INTEGER;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Must be logged in to purchase.';
  END IF;

  SELECT 
    CASE 
      WHEN p_currency_used = 'fils' THEN fils
      WHEN p_currency_used = 'derhem' THEN derhem
      WHEN p_currency_used = 'dinar' THEN dinar
      ELSE 0
    END
  INTO v_curr_balance
  FROM profiles WHERE id = auth.uid();

  IF v_curr_balance < p_price THEN
    RAISE EXCEPTION 'Insufficient balance.';
  END IF;

  IF p_item_id = 'premium_bundle' THEN
    UPDATE profiles
    SET
      fils = fils + 1000 - CASE WHEN p_currency_used = 'fils' THEN p_price ELSE 0 END,
      derhem = derhem - CASE WHEN p_currency_used = 'derhem' THEN p_price ELSE 0 END,
      dinar = dinar - CASE WHEN p_currency_used = 'dinar' THEN p_price ELSE 0 END,
      magnets = COALESCE(magnets, 3) + 3,
      skips = COALESCE(skips, 3) + 2,
      hints = COALESCE(hints, 3) + 1,
      updated_at = NOW()
    WHERE id = auth.uid();
  END IF;

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
