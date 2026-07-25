
-- Update RLS for user_reports to allow admin email to view reports
DROP POLICY IF EXISTS "Admin can view and update reports" ON public.user_reports;

CREATE POLICY "Admin can view and update reports"
ON public.user_reports
FOR ALL
USING (
    auth.uid() = '9a813c24-b662-477d-a74a-6f822d17bbf1' OR 
    (auth.jwt() ->> 'email') = '4rasti@gmail.com'
);

-- Storage Policy: Admin can delete images (if needed)
DROP POLICY IF EXISTS "Admin can delete report images" ON storage.objects;

CREATE POLICY "Admin can delete report images"
ON storage.objects
FOR DELETE
USING (
    bucket_id = 'report_images' AND
    (
      auth.uid() = '9a813c24-b662-477d-a74a-6f822d17bbf1' OR 
      (auth.jwt() ->> 'email') = '4rasti@gmail.com'
    )
);

