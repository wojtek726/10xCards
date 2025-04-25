-- Modify the flashcards table to add CASCADE DELETE constraint
-- First, drop existing foreign key constraint if it exists
ALTER TABLE flashcards DROP CONSTRAINT IF EXISTS flashcards_user_id_fkey;

-- Add foreign key constraint with CASCADE DELETE
ALTER TABLE flashcards
ADD CONSTRAINT flashcards_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- Create a trigger to handle user deletion in auth.users
CREATE OR REPLACE FUNCTION handle_deleted_user()
RETURNS TRIGGER AS $$
BEGIN
  -- When a user is deleted from auth.users, 
  -- the foreign key constraint will automatically delete their flashcards
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger for delete operations on auth.users
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_deleted_user(); 