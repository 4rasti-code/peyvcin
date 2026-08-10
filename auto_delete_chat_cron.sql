-- سیستەمێ ژێبرنا ئۆتۆماتیکی یێ نامەیان و فایلان (Snapchat Style)
-- ئەڤ کۆدە دێ هەر نامەیەکا و فایلەکێ کەڤنتر ژ ٢٤ دەمژمێران ب ئێکجاری ژ ناڤ داتابەیسێ و سێرڤەری ڕەش کەت

-- ١. کارپێکرنا درێژکراوەیا pg_cron (ئەگەر کارا نەبیت)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ٢. دانانا خشتەیێ کاری (Cron Job) کو هەر دەمژمێرەکێ جارەکێ کار بکەت
SELECT cron.schedule(
    'delete-old-messages-and-files',  -- ناڤێ کارێ ئۆتۆماتیکی
    '0 * * * *',                      -- هەر دەمژمێرەکێ ل خولەکا ٠ کار دکەت
    $$ 
       -- ١. ژێبرنا نامەیێن نڤیسینێ ژ خشتەیێ messages
       DELETE FROM public.messages 
       WHERE created_at < NOW() - INTERVAL '24 hours';
       
       -- ٢. ژێبرنا فایلێن دەنگی (ڤۆیس) ژ ناڤ سەتەلا Storage ب ئێکجاری (وێنە ژێناچن)
       DELETE FROM storage.objects 
       WHERE bucket_id = 'chat_audio' 
         AND created_at < NOW() - INTERVAL '24 hours';
    $$
);

-- تێبینی: ئەگەر تە بڤێت تو ئەڤی کارێ ئۆتۆماتیکی ڕاوەستینی ل پاشەڕۆژێ، دشێی ڤی کۆدی بکاربینی:
-- SELECT cron.unschedule('delete-old-messages-and-files');
