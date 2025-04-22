-- Drop existing constraint and index
ALTER TABLE users 
  DROP CONSTRAINT IF EXISTS users_login_key;

-- Rename login column to email and update its constraints
ALTER TABLE users 
  RENAME COLUMN login TO email;

-- Update email column constraints
ALTER TABLE users 
  ALTER COLUMN email TYPE varchar(255),
  ADD CONSTRAINT users_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Add new unique constraint for email
ALTER TABLE users 
  ADD CONSTRAINT users_email_key UNIQUE (email); 