-- ================================================================
-- Peyvok: SOCIAL ONBOARDING & NICKNAME SELECTION
-- ================================================================
-- This script enables a "Choose your nickname" flow for social logins.

-- 1. ADD ONBOARDED COLUMN
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarded BOOLEAN DEFAULT false;

-- 2. UPDATE TRIGGER TO HANDLE ONBOARDING STATE
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_base_nickname TEXT;
    v_final_nickname TEXT;
    v_is_onboarded BOOLEAN := false;
    v_counter INTEGER := 0;
BEGIN
    -- Extract base nickname
    -- Priority: username (Email signup) > nickname > full_name > name > 'یاریکەر'
    v_base_nickname := COALESCE(
      (new.raw_user_meta_data->>'username'),
      (new.raw_user_meta_data->>'nickname'),
      (new.raw_user_meta_data->>'full_name'),
      (new.raw_user_meta_data->>'name'),
      'یاریکەر'
    );
    
    -- If it's an email signup (username exists in metadata), consider them already onboarded
    IF (new.raw_user_meta_data->>'username') IS NOT NULL THEN
        v_is_onboarded := true;
    END IF;

    v_base_nickname := trim(v_base_nickname);
    v_final_nickname := v_base_nickname;

    -- Ensure initial nickname is unique (even if they will change it later)
    WHILE EXISTS (SELECT 1 FROM public.profiles WHERE nickname = v_final_nickname) AND v_counter < 5 LOOP
        v_counter := v_counter + 1;
        v_final_nickname := v_base_nickname || '_' || substring(new.id::text from 1 for 4);
    END LOOP;

    INSERT INTO public.profiles (
        id, 
        nickname, 
        onboarded,
        fils, 
        derhem, 
        dinar,
        magnets, 
        hints, 
        skips,
        avatar_url,
        inventory,
        country_code,
        is_kurdistan,
        updated_at
    )
    VALUES (
        new.id, 
        v_final_nickname,
        v_is_onboarded,
        100, 
        10,  
        5,   
        3,   
        3,   
        3,   
        'default',
        '{"owned_avatars": ["default"], "unlocked_themes": ["default"], "solved_words": []}'::JSONB,
        COALESCE(new.raw_user_meta_data->>'country_code', 'KD'),
        true,
        NOW()
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. RPC TO COMPLETE ONBOARDING
-- This function allows the user to set their final unique nickname and mark onboarding as complete.
CREATE OR REPLACE FUNCTION public.complete_onboarding(p_nickname TEXT)
RETURNS JSON AS $$
BEGIN
    -- Security check
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Unauthorized';
    END IF;

    -- Check if nickname is taken
    IF EXISTS (SELECT 1 FROM public.profiles WHERE nickname = p_nickname AND id != auth.uid()) THEN
        RAISE EXCEPTION 'Nickname already taken';
    END IF;

    -- Validation
    IF length(p_nickname) < 8 OR length(p_nickname) > 15 THEN
        RAISE EXCEPTION 'Nickname must be between 8 and 15 characters';
    END IF;

    UPDATE public.profiles
    SET 
        nickname = p_nickname,
        onboarded = true,
        updated_at = NOW()
    WHERE id = auth.uid();

    -- Also update auth metadata for consistency
    -- Note: This requires the user to be currently logged in and using the client lib to see it immediately
    -- but the DB record is the source of truth.

    RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
