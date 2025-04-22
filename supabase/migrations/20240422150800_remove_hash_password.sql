-- Remove hash_password column from users table
ALTER TABLE public.users DROP COLUMN IF EXISTS hash_password; 