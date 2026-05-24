-- Run this script in the Supabase SQL Editor to delete the specified words

DELETE FROM public.words
WHERE word IN (
  'ھەڤاڵ', 
  'ھونەر', 
  'ھەڵمەت', 
  'ھەندرین', 
  'ھەردی', 
  'ھاوژین', 
  'بەھرام'
);
