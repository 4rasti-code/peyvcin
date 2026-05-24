-- Add new animal words to the database
INSERT INTO public.words (word, hint, category)
VALUES
('سیسڕک', 'گیانەوەر', 'گیانەوەر'),
('خالخالۆک', 'گیانەوەر', 'گیانەوەر'),
('کرم', 'گیانەوەر', 'گیانەوەر')
ON CONFLICT (word) 
DO UPDATE SET 
    hint = EXCLUDED.hint,
    category = EXCLUDED.category;
