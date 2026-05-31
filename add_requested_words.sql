-- ئەڤ فایلە دێ پەیڤێن نووی ل سوپابەیسی زێدە کەت
-- دەتوانن ئەم کۆدە لە بەشی SQL Editor لە Supabase بەکاربهێنن و ڕەنی بکەن

INSERT INTO public.words (word, hint, category, mode_tags) VALUES
('تەنشت', 'پشکا تەنیشتێ یا لەشی', 'ئەندامێ لەشی', ARRAY['classic', 'secret_word']),
('ریڤیک', 'بۆرییێن درێژ یێن ناڤ زکی بۆ ڤەگوھاستنا پاشمایێن خوارنێ', 'ئەندامێ لەشی', ARRAY['classic', 'secret_word']),
('مێلاک', 'ئەندامەکێ گرنگە د ناڤ زکیدا (جەگەر)', 'ئەندامێ لەشی', ARRAY['classic', 'secret_word']),
('لەفە', 'خوارنەکا ب لەزە کو د ناڤ نانی دا دهێتە پێچان', 'خوارن', ARRAY['classic', 'secret_word']),
('مرۆڤ', 'کەس، بەنیئادەم', 'ناڤێ مرۆڤان', ARRAY['classic', 'secret_word']),
('مشار', 'هێڤە دارە . وێڤە دارە، د نیڤێدا گورگێ هارە.', 'مامک', ARRAY['mamak'])
ON CONFLICT (word, hint) DO NOTHING;
