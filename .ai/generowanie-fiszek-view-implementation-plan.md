# Plan implementacji widoku Ekran Generowania Fiszek (AI)

## 1. Przegląd
Widok umożliwia użytkownikowi wprowadzenie tekstu, którego celem jest wygenerowanie sugestii fiszki przy użyciu mechanizmu AI. Po wygenerowaniu fiszki użytkownik otrzyma możliwość akceptacji (co zapisze fiszkę) lub odrzucenia (co umożliwi ponowne generowanie). Widok komunikuje się z backendem za pomocą endpointu POST /flashcards/generate.

## 2. Routing widoku
Ścieżka: /flashcards/generate

## 3. Struktura komponentów
- **GenerowanieFiszkiView** (główny kontener widoku)
  - **InputForm** (formularz wprowadzania tekstu)
    - **TextArea** (pole na wprowadzenie tekstu)
    - **Button "Generuj"** (wywołanie akcji generacji)
  - **Loader** (wyświetlany podczas oczekiwania na wynik API)
  - **FlashcardSuggestionCard** (wyświetla wygenerowaną fiszkę)
    - **Accept Button** (akceptacja i zapis fiszki przez API)
    - **Reject Button** (odrzucenie sugerowanej fiszki)
  - **InlineError** (wyświetlanie komunikatów błędów)

## 4. Szczegóły komponentów
### GenerowanieFiszkiView
- **Opis:** Główny kontener widoku, zarządzający logiką przepływu: przyjmowanie danych wejściowych, wywoływanie API, aktualizacja stanu i obsługa akcji użytkownika.
- **Główne elementy:** InputForm, Loader, FlashcardSuggestionCard, InlineError.
- **Obsługiwane interakcje:** Kliknięcie przycisku "Generuj", "Akceptuj" i "Odrzuć".
- **Warunki walidacji:** Tekst wejściowy musi mieć długość od 1 do 1000 znaków.
- **Typy:** Używa GenerateFlashcardRequestDTO i GenerateFlashcardResponseDTO.
- **Propsy:** Brak – stan zarządzany lokalnie wewnątrz komponentu.

### InputForm
- **Opis:** Formularz umożliwiający wpisanie tekstu do generowania fiszki.
- **Główne elementy:** TextArea oraz przycisk "Generuj".
- **Obsługiwane interakcje:** onChange dla TextArea, onClick dla przycisku "Generuj".
- **Warunki walidacji:** Tekst nie może być pusty; maksymalna długość 1000 znaków.
- **Typy:** String (wartość wprowadzanego tekstu).
- **Propsy:** Funkcja onSubmit przekazywana z GenerowanieFiszkiView.

### FlashcardSuggestionCard
- **Opis:** Komponent prezentujący sugerowaną fiszkę otrzymaną z API.
- **Główne elementy:** Wyświetlanie pól "front" i "back", przyciski "Akceptuj" i "Odrzuć".
- **Obsługiwane interakcje:** onClick dla przycisków "Akceptuj" i "Odrzuć".
- **Warunki walidacji:** Wyświetlenie danych następuje tylko wtedy, gdy odpowiedź API jest poprawna.
- **Typy:** Obiekt typu { front: string; back: string; suggested_card_origin: 'ai' }.
- **Propsy:** suggestion (dane wygenerowanej fiszki), onAccept (callback), onReject (callback).

### Loader
- **Opis:** Komponent wizualny wskazujący na trwające przetwarzanie (np. animacja ładowania).
- **Główne elementy:** Ikona lub animacja ładowania.
- **Obsługiwane interakcje:** Brak interakcji użytkownika.
- **Warunki walidacji:** Wyświetlany, gdy stan "loading" jest aktywny.
- **Typy:** Prosty komponent prezentacyjny.
- **Propsy:** visible (boolean).

### InlineError
- **Opis:** Komponent do wyświetlania komunikatów błędów.
- **Główne elementy:** Tekst komunikatu błędu.
- **Obsługiwane interakcje:** Brak interakcji użytkownika.
- **Warunki walidacji:** Wyświetlany, gdy istnieje komunikat błędu w stanie.
- **Typy:** String (errorMessage).
- **Propsy:** errorMessage.

## 5. Typy
- **GenerateFlashcardRequestDTO:** { input_text: string }
- **GenerateFlashcardResponseDTO:** { suggested_flashcard: { front: string; back: string; suggested_card_origin: 'ai' } }
- **ViewModel dla fiszki:** { front: string; back: string; cardOrigin: 'ai' }

## 6. Zarządzanie stanem
- **Lokalny stan w GenerowanieFiszkiView:**
  - inputText: string
  - loading: boolean
  - error: string | null
  - suggestion: ViewModel | null
- **Custom hook (opcjonalnie):** useFlashcardGeneration do obsługi logiki wywołania API oraz aktualizacji stanu.

## 7. Integracja API
- **Endpoint:** POST /flashcards/generate
- **Żądanie:** GenerateFlashcardRequestDTO
- **Odpowiedź:** GenerateFlashcardResponseDTO
- **Logika:** Po kliknięciu "Generuj" wywołać API, ustawić stan loading na true. Po otrzymaniu odpowiedzi, zaktualizować stan suggestion. W przypadku błędu ustawić stan error i wyświetlić komunikat.
- **Akceptacja fiszki:** Wywołanie kolejnego endpointu POST /flashcards w celu zapisania akceptowanej fiszki.

## 8. Interakcje użytkownika
- Użytkownik wprowadza tekst w polu tekstowym.
- Po naciśnięciu przycisku "Generuj", formularz waliduje dane i wywołuje API.
- Podczas oczekiwania wyświetlany jest Loader.
- Po udanym wywołaniu API, pojawia się FlashcardSuggestionCard z danymi fiszki.
- Użytkownik może kliknąć "Akceptuj", aby zatwierdzić fiszkę i zapisać ją przez API, lub "Odrzuć", aby usunąć aktualną sugestię i rozpocząć nową próbę.

## 9. Warunki i walidacja
- Tekst wejściowy musi mieć od 1 do 1000 znaków.
- Odpowiedź z API weryfikowana pod kątem obecności pól "front" i "back".
- Przed wysłaniem żądania akceptacji fiszki należy upewnić się, że suggestion nie jest null.

## 10. Obsługa błędów
- Błędy walidacji (np. puste pole) wyświetlane inline pod polem tekstowym.
- Błędy API (400, 401, timeout) wyświetlane w komponencie InlineError.
- W przypadku błędów sieciowych wyświetlić informację o konieczności ponowienia akcji.

## 11. Kroki implementacji
1. Utworzyć nowy komponent GenerowanieFiszkiView wraz z odpowiednią strukturą folderów.
2. Zaimplementować komponent InputForm z polem TextArea oraz przyciskiem "Generuj" i walidacją danych wejściowych.
3. Dodać logikę wywołania API POST /flashcards/generate przy użyciu fetch lub biblioteki do obsługi zapytań.
4. Zarządzać stanami (inputText, loading, error, suggestion) przy użyciu useState lub custom hooka useFlashcardGeneration.
5. Wyświetlić Loader podczas oczekiwania na odpowiedź z API.
6. Po otrzymaniu odpowiedzi, zaktualizować stan suggestion i wyświetlić FlashcardSuggestionCard.
7. Dodać akcje dla przycisków "Akceptuj" (wywołanie API POST /flashcards) oraz "Odrzuć" (reset stanu).
8. Implementować obsługę błędów i wyświetlanie komunikatów w komponencie InlineError.
9. Przetestować pełny przepływ widoku pod kątem walidacji, interakcji użytkownika i responsywności.
10. Upewnić się, że widok spełnia standardy dostępności zgodnie z wytycznymi. 