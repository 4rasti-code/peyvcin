-- Migration script to add 'last_ip' for tracking accounts to prevent smurfing/abuse
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_ip TEXT;
