-- Enable Row Level Security for flashcards table
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for flashcards
-- Policy for selecting flashcards (users can only see their own flashcards)
CREATE POLICY "Users can view their own flashcards" 
ON flashcards FOR SELECT
USING (auth.uid() = user_id);

-- Policy for inserting flashcards (users can only create flashcards for themselves)
CREATE POLICY "Users can create their own flashcards" 
ON flashcards FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy for updating flashcards (users can only modify their own flashcards)
CREATE POLICY "Users can update their own flashcards" 
ON flashcards FOR UPDATE
USING (auth.uid() = user_id);

-- Policy for deleting flashcards (users can only delete their own flashcards)
CREATE POLICY "Users can delete their own flashcards" 
ON flashcards FOR DELETE
USING (auth.uid() = user_id); 