-- ==========================================
-- 1. Create the `user_reports` Table
-- ==========================================
CREATE TABLE IF NOT EXISTS public.user_reports (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('bug', 'suggestion')),
    description TEXT NOT NULL,
    image_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on the table
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own reports
CREATE POLICY "Users can insert their own reports"
ON public.user_reports
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Admin (Peyvok Bot ID) can SELECT and UPDATE all reports
-- Note: Replace '9a813c24-b662-477d-a74a-6f822d17bbf1' if your bot ID is different.
CREATE POLICY "Admin can view and update reports"
ON public.user_reports
FOR ALL
USING (auth.uid() = '9a813c24-b662-477d-a74a-6f822d17bbf1');

-- ==========================================
-- 2. Setup `report_images` Storage Bucket
-- ==========================================
-- INSTRUCTIONS FOR BUCKET CREATION:
-- 1. Go to Supabase Dashboard -> Storage -> Create a new bucket.
-- 2. Name it EXACTLY: `report_images`
-- 3. Make sure to toggle "Public bucket" to ON.
-- 4. Run the following policies in the SQL Editor to secure the bucket:

-- Storage Policy: Users can upload images
CREATE POLICY "Any authenticated user can insert report images"
ON storage.objects
FOR INSERT
WITH CHECK (
    bucket_id = 'report_images' AND
    auth.role() = 'authenticated'
);

-- Storage Policy: Public can view images (since it's a public bucket)
CREATE POLICY "Public can view report images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'report_images');

-- Storage Policy: Admin can delete images (if needed)
CREATE POLICY "Admin can delete report images"
ON storage.objects
FOR DELETE
USING (
    bucket_id = 'report_images' AND
    auth.uid() = '9a813c24-b662-477d-a74a-6f822d17bbf1'
);
