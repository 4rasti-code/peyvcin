-- 1. Ensure all columns exist so INSERT never fails
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarded BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS haptic_enabled BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS inventory JSONB DEFAULT '{"owned_avatars": ["default"], "unlocked_themes": ["default"], "solved_words": []}'::JSONB;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS magnets INTEGER DEFAULT 3;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS hints INTEGER DEFAULT 3;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS skips INTEGER DEFAULT 3;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS fils INTEGER DEFAULT 100;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS derhem INTEGER DEFAULT 10;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS dinar INTEGER DEFAULT 5;

-- 2. Ensure sequence exists
CREATE SEQUENCE IF NOT EXISTS public.guest_name_seq START WITH 1;

-- 3. Replace the trigger with absolute safety
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_base_nickname TEXT := '';
    v_final_nickname TEXT := '';
    v_counter INTEGER := 0;
    v_avatar_url TEXT := 'default';
BEGIN
    -- Safely extract name
    IF new.raw_user_meta_data IS NOT NULL THEN
        v_base_nickname := COALESCE(
            (new.raw_user_meta_data->>'username'),
            (new.raw_user_meta_data->>'nickname'),
            (new.raw_user_meta_data->>'global_name'),
            (new.raw_user_meta_data->>'full_name'),
            (new.raw_user_meta_data->>'name'),
            ''
        );
        
        v_avatar_url := COALESCE(
            (new.raw_user_meta_data->>'avatar_url'),
            (new.raw_user_meta_data->>'picture'),
            'default'
        );
    END IF;

    -- If no valid name is found (like guests), use the sequential guest name
    IF v_base_nickname IS NULL OR trim(v_base_nickname) = '' THEN
        v_final_nickname := 'بێناڤ_' || FLOOR(RANDOM() * 9000 + 1000)::text;
        BEGIN
            v_final_nickname := 'بێناڤ_' || nextval('public.guest_name_seq')::text;
        EXCEPTION WHEN OTHERS THEN
        END;
    ELSE
        -- Clean nickname
        v_base_nickname := trim(v_base_nickname);
        v_final_nickname := v_base_nickname;

        WHILE EXISTS (SELECT 1 FROM public.profiles WHERE nickname = v_final_nickname) AND v_counter < 5 LOOP
            v_counter := v_counter + 1;
            BEGIN
                v_final_nickname := v_base_nickname || '_' || nextval('public.guest_name_seq')::text;
            EXCEPTION WHEN OTHERS THEN
                v_final_nickname := v_base_nickname || '_' || floor(random() * 10000)::text;
            END;
        END LOOP;
    END IF;

    -- Insert profile safely (using only guaranteed columns)
    -- All other columns will be populated by their defaults
    INSERT INTO public.profiles (
      id,
      nickname,
      avatar_url
    )
    VALUES (
      new.id,
      v_final_nickname,
      v_avatar_url
    );

    RETURN new;
EXCEPTION WHEN OTHERS THEN
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
