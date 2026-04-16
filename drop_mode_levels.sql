-- Drop redundant mode-specific level columns
-- All progression will now use the global 'level' and 'xp' columns
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS mamak_level,
DROP COLUMN IF EXISTS secret_word_level,
DROP COLUMN IF EXISTS word_fever_level,
DROP COLUMN IF EXISTS hard_word_count;

-- Optional: Ensure index on level for performance
CREATE INDEX IF NOT EXISTS idx_profiles_level ON public.profiles(level);
