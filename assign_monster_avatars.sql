-- 1. Update all existing users who have no avatar or the old 'default' avatar
UPDATE public.profiles
SET avatar_url = '/Monster_Avatars/Monster_Avatars-0' || floor(random() * 9 + 1)::int || '.svg'
WHERE avatar_url IS NULL OR avatar_url = 'default';

-- 2. Update the trigger function so all NEW users also get a random monster avatar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    seq_name TEXT;
    seq_num INT;
    ku_digits TEXT;
    guest_nickname TEXT;
    random_monster TEXT;
BEGIN
    -- Pick a random monster avatar for new users
    random_monster := '/Monster_Avatars/Monster_Avatars-0' || floor(random() * 9 + 1)::int || '.svg';

    -- Generate a sequential guest name
    seq_name := get_next_guest_name();
    seq_num := CAST(SPLIT_PART(seq_name, '_', 2) AS INT);

    ku_digits := REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
        seq_num::TEXT,
        '0', '٠'), '1', '١'), '2', '٢'), '3', '٣'), '4', '٤'),
        '5', '٥'), '6', '٦'), '7', '٧'), '8', '٨'), '9', '٩'
    );
    guest_nickname := 'بێناڤ ' || ku_digits;

    INSERT INTO public.profiles (
        id,
        nickname,
        avatar_url,
        country_code,
        is_kurdistan,
        fils,
        derhem,
        dinar,
        onboarded
    )
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'nickname', new.raw_user_meta_data->>'full_name', guest_nickname),
        COALESCE(new.raw_user_meta_data->>'avatar_url', random_monster),
        'IQ',
        true,
        500,
        10,
        5,
        false
    );

    RETURN new;
END;
$$;
