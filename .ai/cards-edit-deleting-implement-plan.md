# Plan implementacji edycji i usuwania fiszek

## 1. Modyfikacje w bazie danych

### Tabela flashcards
- Dodanie kolumny `card_origin` typu ENUM:
  - 'ai' - fiszka wygenerowana przez AI
  - 'ai_modified' - fiszka AI po modyfikacji
  - 'manual' - fiszka utworzona ręcznie

## 2. Komponenty UI

### FlashcardCard.tsx
- Dodanie przycisków akcji:
  - Edytuj (ikona ołówka)
  - Usuń (ikona kosza)
- Wyświetlanie badge'a z pochodzeniem fiszki (ai/ai_modified/manual)
- Modal potwierdzenia usunięcia

### FlashcardEditModal.tsx
- Formularz edycji z polami:
  - Przód fiszki (textarea)
  - Tył fiszki (textarea)
- Przyciski:
  - Zapisz
  - Anuluj
- Walidacja pól (1-200 znaków dla przodu, 1-500 dla tyłu)

## 3. API Endpoints

### PUT /api/flashcards/:id
- Request body:
```typescript
{
  front: string;
  back: string;
}
```
- Logika:
  - Sprawdzenie czy fiszka należy do zalogowanego użytkownika
  - Jeśli fiszka była typu 'ai', zmiana na 'ai_modified'
  - Aktualizacja pól front/back
  - Aktualizacja updated_at

### DELETE /api/flashcards/:id
- Logika:
  - Sprawdzenie czy fiszka należy do zalogowanego użytkownika
  - Miękkie usunięcie fiszki (dodanie deleted_at)

## 4. Integracja z istniejącym kodem

### Modyfikacje w src/pages/flashcards/index.astro
- Dodanie komponentu FlashcardCard zamiast obecnego div'a
- Przekazywanie props do FlashcardCard

### Modyfikacje w src/lib/services/flashcard.service.ts
- Dodanie metod:
  - updateFlashcard
  - deleteFlashcard
  - Aktualizacja getFlashcard i getFlashcards o obsługę deleted_at

## 5. Testy

### Jednostkowe
- FlashcardCard.test.tsx
- FlashcardEditModal.test.tsx

### Integracyjne
- Edycja fiszki (ai -> ai_modified)
- Usuwanie fiszki
- Walidacja formularza edycji

### E2E
- Pełny flow edycji fiszki
- Pełny flow usuwania fiszki

## 6. Kryteria akceptacji

1. Użytkownik może edytować swoje fiszki
2. Fiszki AI po edycji są oznaczane jako 'ai_modified'
3. Użytkownik może usuwać swoje fiszki
4. Wyświetlane jest pochodzenie fiszki (ai/ai_modified/manual)
5. Formularze posiadają odpowiednią walidację
6. Wszystkie akcje wymagają potwierdzenia
7. UI jest responsywne i dostępne