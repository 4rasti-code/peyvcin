-- ١. دروستکرنا سەتەلا دەنگی ب شێوەیەکێ ئۆتۆماتیکی (ئەگەر تە بەری نۆکە یا دروست نەکری)
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat_audio', 'chat_audio', true)
ON CONFLICT (id) DO NOTHING;

-- ٢. ڕێگەدان ب یاریزانان (یێن کو هەژمار هەی) کو دەنگی بهنێرن بۆ ناڤ سەتەلێ
CREATE POLICY "Users can upload chat audio" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'chat_audio');

-- ٣. ڕێگەدان ب هەمی کەسان کو گوهدارییا دەنگی بکەن
CREATE POLICY "Anyone can view chat audio" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'chat_audio');
