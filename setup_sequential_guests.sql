-- ================================================================
-- PEYVOK: SEQUENTIAL GUEST NAMES
-- ================================================================
-- This script updates the database to support sequential guest names
-- using the format 'بێناڤ_1', 'بێناڤ_2', etc.

-- 1. Create a sequence for guest numbers
CREATE SEQUENCE IF NOT EXISTS public.guest_name_seq START WITH 1;

-- 2. Create an RPC so the frontend can safely get the next sequential guest name if needed
CREATE OR REPLACE FUNCTION public.get_next_guest_name()
RETURNS TEXT AS $$
BEGIN
    RETURN 'بێناڤ_' || nextval('public.guest_name_seq')::text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Update the auth trigger to assign sequential names to users without names
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_base_nickname TEXT;
    v_final_nickname TEXT;
    v_counter INTEGER := 0;
BEGIN
    -- Extract base nickname from metadata
    v_base_nickname := COALESCE(
      (new.raw_user_meta_data->>'username'),
      (new.raw_user_meta_data->>'nickname'),
      (new.raw_user_meta_data->>'full_name'),
      (new.raw_user_meta_data->>'name')
    );
    
    -- If no valid name is found, use the sequential guest name
    IF v_base_nickname IS NULL OR trim(v_base_nickname) = '' THEN
        v_final_nickname := 'بێناڤ_' || nextval('public.guest_name_seq')::text;
    ELSE
        -- Clean nickname (remove problematic characters if any)
        v_base_nickname := trim(v_base_nickname);
        v_final_nickname := v_base_nickname;

        -- LOOP TO ENSURE UNIQUE NICKNAME FOR CUSTOM NAMES
        WHILE EXISTS (SELECT 1 FROM public.profiles WHERE nickname = v_final_nickname) AND v_counter < 5 LOOP
            v_counter := v_counter + 1;
            IF v_counter = 1 THEN
                v_final_nickname := v_base_nickname || '_' || substring(new.id::text from 1 for 4);
            ELSE
                v_final_nickname := v_base_nickname || '_' || floor(random() * 10000)::text;
            END IF;
        END LOOP;
        
        -- Ultimate fallback if still taken
        IF EXISTS (SELECT 1 FROM public.profiles WHERE nickname = v_final_nickname) THEN
            v_final_nickname := v_base_nickname || '_' || floor(random() * 999999)::text;
        END IF;
    END IF;

    -- Insert profile
    INSERT INTO public.profiles (
      id,
      nickname,
      avatar_url,
      fils,
      derhem,
      dinar,
      level,
      xp
    )
    VALUES (
      new.id,
      v_final_nickname,
      'default',
      100,
      50,
      0,
      1,
      0
    );

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
