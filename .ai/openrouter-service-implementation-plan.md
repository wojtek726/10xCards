# Przewodnik Implementacji Usługi OpenRouter

## 1. Opis usługi
Usługa OpenRouter integruje się z interfejsem API OpenRouter w celu uzupełnienia czatów opartych na LLM. Jej główne zadania to:

1. Odbieranie komunikatów wejściowych od użytkownika i systemu.
2. Budowanie struktury żądania z uwzględnieniem:
   - Komunikatu systemowego (np. "You are a helpful assistant.")
   - Komunikatu użytkownika (treść pytania lub kontekstu).
   - Ustrukturyzowanego response_format, np. { type: 'json_schema', json_schema: { name: 'chatResponse', strict: true, schema: { question: 'string', answer: 'string' } } }.
3. Wysyłanie żądania do API OpenRouter przy użyciu odpowiedniej nazwy modelu (np. "gpt-4") i parametrów modelu (np. temperature, max_tokens).
4. Parsowanie oraz walidacja odpowiedzi, a także obsługa wszelkich błędów.

## 2. Opis konstruktora
Konstruktor usługi OpenRouter powinien inicjalizować konfigurację niezbędną do komunikacji z API. W skład konstruktora wchodzą:

1. Przechowywanie klucza API (np. w zmiennej środowiskowej `OPENROUTER_API_KEY`).
2. Ustawienie podstawowego URL API (np. `https://api.openrouter.ai/v1`).
3. Definicja domyślnej nazwy modelu (np. `gpt-4`) oraz domyślnych parametrów modelu, takich jak `temperature` czy `max_tokens`.

_Przykład inicjalizacji:_
```ts
this.apiKey = process.env.OPENROUTER_API_KEY;
this.baseUrl = 'https://api.openrouter.ai/v1';
this.defaultModelName = 'gpt-4';
this.defaultModelParameters = { temperature: 0.7, max_tokens: 150 };
```

## 3. Publiczne metody i pola

### Publiczne metody
1. **sendChatCompletion(input: ChatInput): Promise<ChatResponse>**
   - Funkcjonalność: Przyjmuje obiekt `ChatInput`, który zawiera komunikat systemowy oraz użytkownika. Buduje payload, wysyła żądanie do API, parsuje odpowiedź i zwraca wynik.
2. **setModelParameters(params: ModelParameters): void**
   - Funkcjonalność: Umożliwia dynamiczną zmianę parametrów modelu, takich jak `temperature`, `max_tokens` czy inne parametry określone przez OpenRouter API.

### Pola publiczne
- `apiKey`: Klucz API wymagany do autoryzacji.
- `baseUrl`: Bazowy URL endpointu OpenRouter API.

## 4. Prywatne metody i pola

### Prywatne metody
1. **buildPayload(input: ChatInput): RequestPayload**
   - Funkcjonalność: Łączy komunikaty systemowe i użytkownika, dodaje konfigurację modelu oraz formatuje dane zgodnie z wymaganym schematem JSON (response_format).
2. **parseResponse(apiResponse: any): ChatResponse**
   - Funkcjonalność: Waliduje i parsuje odpowiedź API, sprawdzając zgodność ze zdefiniowanym `response_format`.

### Prywatne pola
- `defaultModelName`: Domyślna nazwa modelu wykorzystywana przy wysyłaniu żądań.
- `defaultModelParameters`: Domyślne ustawienia parametrów modelu (np. temperature, max_tokens).

## 5. Obsługa błędów

### Potencjalne scenariusze błędów
1. **Błąd sieci** – problemy z połączeniem, timeout lub niestabilne połączenie.
2. **Błąd walidacji odpowiedzi** – niezgodność odpowiedzi z oczekiwanym schematem JSON, brak wymaganych pól.
3. **Błąd autoryzacji** – niepoprawny lub nieważny API key.
4. **Błąd serwera** – wewnętrzne błędy API OpenRouter.

### Proponowane rozwiązania
1. Wdrożenie timeoutów oraz mechanizmu ponownych prób (retry) z wykładniczym opóźnieniem.
2. Wykorzystanie walidacji schematu (np. biblioteka Ajv) dla `response_format`.
3. Obsługa kodów statusu HTTP oraz zwracanie czytelnych komunikatów błędów.
4. Logowanie błędów przy jednoczesnym zachowaniu bezpieczeństwa (bez wycieku wrażliwych danych).

## 6. Kwestie bezpieczeństwa

1. **Przechowywanie klucza API:** Użycie zmiennych środowiskowych (np. `process.env.OPENROUTER_API_KEY`) oraz bezpieczne zarządzanie sekretami.
2. **Bezpieczna komunikacja:** Wymuszenie połączeń HTTPS przy wysyłaniu żądań do API.
3. **Walidacja danych wejściowych:** Sanitacja oraz weryfikacja danych przekazywanych przez użytkownika i system.
4. **Rate Limiting:** Implementacja ograniczeń dotyczących liczby żądań, aby zapobiegać nadużyciom.
5. **Monitorowanie:** Logowanie zdarzeń i monitorowanie usługi w celu szybkiej reakcji na nieprawidłowości.

## 7. Plan wdrożenia krok po kroku

### Krok 1: Konfiguracja środowiska
- Ustawienie niezbędnych zmiennych środowiskowych (np. `OPENROUTER_API_KEY`).
- Instalacja zależności przy użyciu npm lub yarn.

### Krok 2: Utworzenie modułu usługi
- Utworzenie pliku `src/lib/services/openrouter.service.ts`.
- Zaimplementowanie klasy `OpenRouterService` z konstruktorem inicjalizującym konfigurację (klucz API, baseUrl, domyślne parametry modelu).

### Krok 3: Implementacja publicznych metod
- Implementacja metody `sendChatCompletion`:
  1. Przyjmowanie obiektu `ChatInput` zawierającego:
     - Komunikat systemowy (np. "You are a helpful assistant.")
     - Komunikat użytkownika.
  2. Budowanie payload przy użyciu metody `buildPayload`.
  3. Wysyłanie żądania HTTP do OpenRouter API z uwzględnieniem:
     - Nazwy modelu (np. "gpt-4").
     - Parametrów modelu (np. temperature, max_tokens).
     - Ustrukturyzowanego response_format, np.:
       { type: 'json_schema', json_schema: { name: 'chatResponse', strict: true, schema: { question: 'string', answer: 'string' } } }
  4. Parsowanie odpowiedzi za pomocą metody `parseResponse`.
- Implementacja metody `setModelParameters` umożliwiającej dynamiczne zmiany konfiguracji modelu.

### Krok 4: Implementacja metod prywatnych
- Zaimplementowanie metody `buildPayload`, która:
  1. Łączy komunikaty systemowy i użytkownika.
  2. Dołącza konfigurację modelu (nazwa i parametry).
  3. Formatuje dane zgodnie z wymaganym schematem JSON.
- Zaimplementowanie metody `parseResponse`, która waliduje odpowiedź na podstawie zdefiniowanego schematu `response_format`.

### Krok 5: Obsługa błędów
- Dodanie bloków try/catch do kluczowych metod (np. `sendChatCompletion`).
- Wdrożenie mechanizmu retry dla błędów sieciowych.
- Logowanie błędów oraz zwracanie czytelnych komunikatów użytkownikowi.

### Krok 6: Testowanie
- Napisanie testów jednostkowych i integracyjnych dla:
  1. Poprawnego budowania payloadu i wysyłania żądania.
  2. Parsowania oraz walidacji odpowiedzi.
  3. Obsługi scenariuszy błędów (timeout, autoryzacja, błąd serwera).

### Krok 7: Wdrożenie i monitorowanie
- Integracja z CI/CD (np. Github Actions).
- Wdrożenie usługi w środowisku testowym, a następnie produkcyjnym.
- Monitorowanie logów, wydajności oraz zachowania usługi w celu szybkiej interwencji w razie problemów.
- Przygotowanie strategii rollback na wypadek krytycznych błędów. 