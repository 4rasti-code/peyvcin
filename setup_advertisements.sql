-- دانا خشتەیێ ڕیکلامان
CREATE TABLE IF NOT EXISTS public.advertisements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    image_url TEXT NOT NULL,
    link_url TEXT,
    title TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- دانا دەستهەڵاتان بۆ وەرگرتنا داتایان ژ لایێ هەمی یاریزانان ڤە
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "هەمی کەس دشێن ڕیکلامان ببینن" ON public.advertisements;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.advertisements;

CREATE POLICY "Enable read access for all users" 
ON public.advertisements 
FOR SELECT 
TO anon, authenticated
USING (true);

-- پێدانا دەستهەڵاتی بنەڕەتی ب ڕۆڵێن وێبێ (زۆر گرنگە بۆ چارەسەرکرنا کێشەیا 403)
GRANT SELECT ON public.advertisements TO anon, authenticated;
