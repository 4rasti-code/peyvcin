-- Add Font Support to Profiles (Standalone)

-- Add the equipped_font column
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS equipped_font VARCHAR(50) DEFAULT 'default';

-- Add the owned_fonts column (array of text)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS owned_fonts TEXT[] DEFAULT ARRAY['default'];

-- Create an index to quickly filter by equipped fonts (useful if needed later)
CREATE INDEX IF NOT EXISTS idx_profiles_equipped_font ON public.profiles(equipped_font);

-- Standalone RPC function exclusively for purchasing fonts
CREATE OR REPLACE FUNCTION public.buy_font(
  p_item_id TEXT,
  p_currency_used TEXT, -- 'fils', 'derhem', 'dinar'
  p_price INTEGER
)
RETURNS JSON AS $$
DECLARE
  v_curr_balance INTEGER;
  v_owned_fonts TEXT[];
BEGIN
  -- Security check
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Must be logged in to purchase.';
  END IF;

  -- Get current balance and owned fonts array
  SELECT 
    CASE 
      WHEN p_currency_used = 'fils' THEN fils
      WHEN p_currency_used = 'derhem' THEN derhem
      WHEN p_currency_used = 'dinar' THEN dinar
      ELSE 0
    END,
    owned_fonts
  INTO v_curr_balance, v_owned_fonts
  FROM profiles WHERE id = auth.uid();

  -- Initialize array if null
  v_owned_fonts := COALESCE(v_owned_fonts, ARRAY['default']::TEXT[]);

  -- 1. Balance Check
  IF v_curr_balance < p_price THEN
    RAISE EXCEPTION 'Insufficient balance.';
  END IF;

  -- 2. Prevent Duplicate Purchase Check
  IF p_item_id = ANY(v_owned_fonts) THEN
    RAISE EXCEPTION 'Font already owned.';
  END IF;

  -- 3. Process Purchase Transaction
  UPDATE profiles
  SET
    fils = CASE WHEN p_currency_used = 'fils' THEN fils - p_price ELSE fils END,
    derhem = CASE WHEN p_currency_used = 'derhem' THEN derhem - p_price ELSE derhem END,
    dinar = CASE WHEN p_currency_used = 'dinar' THEN dinar - p_price ELSE dinar END,
    owned_fonts = v_owned_fonts || p_item_id,
    updated_at = NOW()
  WHERE id = auth.uid();

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
