CREATE OR REPLACE FUNCTION public.delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 1. داتاکانی یاریزانەکە لە خشتەی پڕۆفایلەکان دەسڕێتەوە
  DELETE FROM public.profiles WHERE id = auth.uid();
  
  -- 2. ئیمەیڵ و پاسۆرد و زانیارییەکانی یاریزانەکە لە سیستەمی سەرەکی Supabase دەسڕێتەوە
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;
