-- سیستەمێ ژێبرنا ئۆتۆماتیکی یێ ئەکاوەنتێن مێهڤان (Guest Deletion Cron)
-- ئەڤ کۆدە دێ هەر مێهڤانەکێ (Anonymous) کۆ ژ ٧ ڕۆژان پتر ب سەر ڕێکەوتێ تۆمارکرنا وی دا دەرباز بوویە ب تەمامی ژ داتابەیسێ ڕەش کەت

-- ١. کارپێکرنا درێژکراوەیا pg_cron (ئەگەر کارا نەبیت)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ٢. دانانا خشتەیێ کاری (Cron Job) کو هەر شەڤ دەمژمێر ١٢ (نیڤا شەڤێ) کار بکەت
SELECT cron.schedule(
    'delete-old-guests-after-7-days',  -- ناڤێ کارێ ئۆتۆماتیکی
    '0 0 * * *',                       -- هەر شەڤ دەمژمێر ٠٠:٠٠ کار دکەت
    $$ 
       -- ١. ژێبرنا زانیاری و پێشکەفتنێن مێهڤانێن کەڤن ژ خشتەیێ profiles 
       -- (پێشتر دڤێت پروفایل بهێنە ژێبرن داکو کێشەیا Foreign Key دروست نەبیت)
       DELETE FROM public.profiles 
       WHERE id IN (
           SELECT id 
           FROM auth.users 
           WHERE is_anonymous = true 
             AND email IS NULL -- دڵنیابوون ژ هندێ کۆ چ ئیمێلەک (گۆگڵ، دیسکۆرد، هتد) نەبیت
             AND created_at < NOW() - INTERVAL '7 days'
       );
       
       -- ٢. ژێبرنا ئەکاوەنتێ مێهڤانان ب تەمامی ژ سیستەمێ سەرەکی یێ چوونە ژوور (auth.users)
       DELETE FROM auth.users 
       WHERE is_anonymous = true 
         AND email IS NULL
         AND created_at < NOW() - INTERVAL '7 days';
    $$
);

-- تێبینی: ئەگەر تە بڤێت تو ئەڤی کارێ ئۆتۆماتیکی ڕاوەستینی ل پاشەڕۆژێ، دشێی ڤی کۆدی بکاربینی:
-- SELECT cron.unschedule('delete-old-guests-after-7-days');
