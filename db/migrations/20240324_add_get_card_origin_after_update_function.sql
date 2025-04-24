-- Funkcja do aktualizacji card_origin po edycji fiszki
CREATE OR REPLACE FUNCTION get_card_origin_after_update(flashcard_id UUID)
RETURNS TEXT AS $$
DECLARE
    current_origin TEXT;
BEGIN
    SELECT card_origin INTO current_origin
    FROM flashcards
    WHERE id = flashcard_id;

    -- Jeśli fiszka była wygenerowana przez AI, zmień na ai_modified
    IF current_origin = 'ai' THEN
        RETURN 'ai_modified';
    END IF;

    -- W przeciwnym razie zachowaj obecne pochodzenie
    RETURN current_origin;
END;
$$ LANGUAGE plpgsql; 