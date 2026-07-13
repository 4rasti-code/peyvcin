CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_base_nickname TEXT := '';
    v_final_nickname TEXT := '';
    v_counter INTEGER := 0;
BEGIN
    -- Safely extract name, handling cases where meta_data is entirely null
    IF new.raw_user_meta_data IS NOT NULL THEN
        v_base_nickname := COALESCE(
            (new.raw_user_meta_data->>'username'),
            (new.raw_user_meta_data->>'nickname'),
            (new.raw_user_meta_data->>'global_name'),
            (new.raw_user_meta_data->>'full_name'),
            (new.raw_user_meta_data->>'name'),
            ''
        );
    END IF;

    -- If no valid name is found (like guests), use the sequential guest name
    IF v_base_nickname IS NULL OR trim(v_base_nickname) = '' THEN
        -- Make sure sequence exists
        v_final_nickname := 'بێناڤ_' || FLOOR(RANDOM() * 9000 + 1000)::text;
        
        -- Try to get sequence if it exists
        BEGIN
            v_final_nickname := 'بێناڤ_' || nextval('public.guest_name_seq')::text;
        EXCEPTION WHEN OTHERS THEN
            -- Fallback to random if sequence is missing
        END;
    ELSE
        -- Clean nickname
        v_base_nickname := trim(v_base_nickname);
        v_final_nickname := v_base_nickname;

        WHILE EXISTS (SELECT 1 FROM public.profiles WHERE nickname = v_final_nickname) AND v_counter < 5 LOOP
            v_counter := v_counter + 1;
            IF v_counter = 1 THEN
                v_final_nickname := v_base_nickname || '_' || substring(new.id::text from 1 for 4);
            ELSE
                v_final_nickname := v_base_nickname || '_' || floor(random() * 10000)::text;
            END IF;
        END LOOP;
    END IF;

    -- Insert profile safely
    INSERT INTO public.profiles (
      id,
      nickname,
      avatar_url,
      onboarded,
      fils,
      derhem,
      dinar,
      magnets,
      hints,
      skips
    )
    VALUES (
      new.id,
      v_final_nickname,
      COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', 'default'),
      false,
      100,
      10,
      5,
      3,
      3,
      3
    );

    RETURN new;
EXCEPTION WHEN OTHERS THEN
    -- If ANYTHING fails in the trigger, still return NEW so the user authentication succeeds!
    -- The frontend's self-heal mechanism will catch the missing profile.
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
