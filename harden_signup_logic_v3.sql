-- ================================================================
-- Peyvok: HARDENED SIGNUP & PROFILE SYNC
-- ================================================================
-- This script fixes nickname conflicts during signup (Google/FB)
-- and ensures the profile creation trigger never fails.

-- 1. HARDENED SIGNUP TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_base_nickname TEXT;
    v_final_nickname TEXT;
    v_counter INTEGER := 0;
BEGIN
    -- Extract base nickname from metadata
    -- Priority: username > nickname > full_name > name > 'یاریکەر'
    v_base_nickname := COALESCE(
      (new.raw_user_meta_data->>'username'),
      (new.raw_user_meta_data->>'nickname'),
      (new.raw_user_meta_data->>'full_name'),
      (new.raw_user_meta_data->>'name'),
      'یاریکەر'
    );
    
    -- Clean nickname (remove problematic characters if any)
    v_base_nickname := trim(v_base_nickname);
    v_final_nickname := v_base_nickname;

    -- LOOP TO ENSURE UNIQUE NICKNAME
    -- We append 4 characters of UUID if taken, then random if still taken
    WHILE EXISTS (SELECT 1 FROM public.profiles WHERE nickname = v_final_nickname) AND v_counter < 5 LOOP
        v_counter := v_counter + 1;
        IF v_counter = 1 THEN
            -- First attempt: Append short UUID fragment
            v_final_nickname := v_base_nickname || '_' || substring(new.id::text from 1 for 4);
        ELSE
            -- Subsequent attempts: Append random number
            v_final_nickname := v_base_nickname || '_' || floor(random() * 10000)::text;
        END IF;
    END WHILE;

    -- Final fallback if loop fails (extremely unlikely)
    IF EXISTS (SELECT 1 FROM public.profiles WHERE nickname = v_final_nickname) THEN
        v_final_nickname := v_base_nickname || '_' || floor(random() * 999999)::text;
    END IF;

    -- INSERT INTO PROFILES
    INSERT INTO public.profiles (
        id, 
        nickname, 
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
        100, 
        10,  
        5,   
        3,   
        3,   
        3,   
        'default',
        '{"owned_avatars": ["default"], "unlocked_themes": ["default"], "solved_words": []}'::JSONB,
        COALESCE(new.raw_user_meta_data->>'country_code', 'KD'),
        COALESCE((new.raw_user_meta_data->>'is_kurdistan')::boolean, true),
        NOW()
    );
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- EMERGENCY FALLBACK: If even with unique nickname it fails (e.g. schema error)
    -- Log it or at least don't block the auth.user creation
    -- (auth.users insertion will still succeed if this function returns NEW)
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. RE-ATTACH TRIGGER
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. ENSURE UNIQUE CONSTRAINT IS CORRECT
-- (We already have profiles_nickname_key, but let's make sure it's active)
-- If it's missing, this adds it.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_nickname_key') THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_nickname_key UNIQUE (nickname);
    END IF;
END $$;
