CREATE OR REPLACE VIEW public.admin_ip_monitoring AS
SELECT 
    id,
    nickname,
    last_ip,
    updated_at
FROM 
    public.profiles
WHERE 
    last_ip IS NOT NULL
ORDER BY 
    updated_at DESC;
