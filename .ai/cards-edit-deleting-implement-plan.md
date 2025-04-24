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

### FlashcardCreateModal.tsx (Nowy)
- Formularz dodawania nowej fiszki:
  - Przód fiszki (textarea)
  - Tył fiszki (textarea)
- Przyciski:
  - Dodaj
  - Anuluj
- Walidacja pól (taka sama jak w edycji)
- Automatyczne ustawienie `card_origin` na 'manual'

### FlashcardsView.tsx
- Dodanie przycisku "Dodaj nową fiszkę" w nagłówku listy
- Integracja z FlashcardCreateModal
- Odświeżanie listy po dodaniu nowej fiszki
- Dodanie animacji przy dodawaniu/usuwaniu fiszek

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
  - Usunięcie fiszki

### POST /api/flashcards (Nowy)
- Request body:
```typescript
{
  front: string;
  back: string;
}
```
- Logika:
  - Walidacja pól
  - Utworzenie nowej fiszki z `card_origin: 'manual'`
  - Przypisanie do zalogowanego użytkownika

## 4. Integracja z istniejącym kodem

### Modyfikacje w src/pages/flashcards/index.astro
- Dodanie komponentu FlashcardCard zamiast obecnego div'a
- Przekazywanie props do FlashcardCard
- Dodanie przycisku tworzenia nowej fiszki

### Modyfikacje w src/lib/services/flashcard.service.ts
- Dodanie metod:
  - createFlashcard
  - updateFlashcard
  - deleteFlashcard
  - Aktualizacja getFlashcard i getFlashcards

## 5. Testy

### Jednostkowe
- FlashcardCard.test.tsx
- FlashcardEditModal.test.tsx
- FlashcardCreateModal.test.tsx (Nowy)

### Integracyjne
- Tworzenie nowej fiszki
- Edycja fiszki (ai -> ai_modified)
- Usuwanie fiszki
- Walidacja formularzy

### E2E
- Pełny flow tworzenia fiszki
- Pełny flow edycji fiszki
- Pełny flow usuwania fiszki

## 6. Kryteria akceptacji

1. Użytkownik może tworzyć nowe fiszki manualnie
2. Użytkownik może edytować swoje fiszki
3. Fiszki AI po edycji są oznaczane jako 'ai_modified'
4. Użytkownik może usuwać swoje fiszki
5. Wyświetlane jest pochodzenie fiszki (ai/ai_modified/manual)
6. Formularze posiadają odpowiednią walidację
7. Wszystkie akcje wymagają potwierdzenia
8. UI jest responsywne i dostępne
9. Animacje zapewniają płynne przejścia przy dodawaniu/usuwaniu