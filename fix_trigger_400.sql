CREATE OR REPLACE FUNCTION public.protect_profile_progression()
RETURNS TRIGGER AS $$
BEGIN
  -- If the update is coming from the 'authenticated' role (client-side), block sensitive changes
  IF current_user = 'authenticated' THEN
    IF (NEW.xp IS DISTINCT FROM OLD.xp) OR
       (NEW.level IS DISTINCT FROM OLD.level) OR
       (NEW.fils IS DISTINCT FROM OLD.fils) OR
       (NEW.derhem IS DISTINCT FROM OLD.derhem) OR
       (NEW.dinar IS DISTINCT FROM OLD.dinar) OR
       (NEW.magnets IS DISTINCT FROM OLD.magnets) OR
       (NEW.hints IS DISTINCT FROM OLD.hints) OR
       (NEW.skips IS DISTINCT FROM OLD.skips) OR
       (NEW.nickname IS DISTINCT FROM OLD.nickname) OR
       (NEW.reward_streak IS DISTINCT FROM OLD.reward_streak) OR
       (NEW.last_reward_claimed_at IS DISTINCT FROM OLD.last_reward_claimed_at) OR
       (NEW.inventory->>'owned_avatars' IS DISTINCT FROM OLD.inventory->>'owned_avatars') OR
       (NEW.inventory->>'unlocked_themes' IS DISTINCT FROM OLD.inventory->>'unlocked_themes')
    THEN
      RAISE EXCEPTION 'Security Violation: Sensitive progression fields can only be modified via secure RPC functions.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
