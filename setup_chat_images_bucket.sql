-- Create the chat_images bucket if it does not exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat_images', 'chat_images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload files to chat_images
CREATE POLICY "Users can upload chat images" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'chat_images');

-- Allow anyone to view files in chat_images
CREATE POLICY "Anyone can view chat images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'chat_images');
