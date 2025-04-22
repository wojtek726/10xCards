# Plan Testów - 10x-cards

## 1. Wprowadzenie i cele testowania

Celem planu testów jest zapewnienie wysokiej jakości aplikacji do zarządzania fiszkami (10x-cards), ze szczególnym uwzględnieniem:

- Niezawodności funkcji autentykacji i autoryzacji
- Poprawności operacji CRUD na fiszkach
- Wydajności integracji z AI do generowania fiszek
- Responsywności i dostępności interfejsu użytkownika
- Zgodności z technologiami Astro 5, React 19, TypeScript 5 i Tailwind 4

## 2. Zakres testów

### 2.1. Komponenty objęte testami

- System autentykacji użytkowników (logowanie, rejestracja, zmiana hasła)
- Zarządzanie fiszkami (CRUD)
- Integracja z AI do generowania fiszek
- Interfejs użytkownika (komponenty, layouty, strony)
- API endpoints (w katalogu `src/pages/api`)
- Integracja z bazą danych Supabase
- Middleware (`src/middleware.ts` oraz `src/middleware/index.ts`)

### 2.2. Komponenty wyłączone z testów

- Zewnętrzne systemy AI (testowane tylko poprzez mock)
- Infrastruktura Supabase (testowana tylko poprzez mock)
- Zewnętrzne biblioteki i komponenty (Shadcn/ui)

## 3. Typy testów

### 3.1. Testy jednostkowe

- Komponenty React (`src/components`)
- Usługi w `src/lib`
- Typy i walidacje DTO (`src/types.ts` i `src/db`)
- Middleware (`src/middleware.ts` i `src/middleware/index.ts`)
- Helpery i utilities

### 3.2. Testy integracyjne

- Przepływ autentykacji
- Operacje na fiszkach
- Integracja z AI
- API endpoints (w `src/pages/api`)
- Integracja frontend-backend

### 3.3. Testy E2E

- Przepływy użytkownika (rejestracja, logowanie, zarządzanie kontem)
- Zarządzanie fiszkami (dodawanie, edycja, usuwanie)
- Generowanie fiszek z AI
- Responsywność interfejsu użytkownika

### 3.4. Testy wydajnościowe

- Ładowanie list fiszek (paginacja, filtrowanie)
- Generowanie fiszek z AI (czas odpowiedzi)
- Responsywność UI
- Czas ładowania strony i komponentów

### 3.5. Testy bezpieczeństwa

- Autentykacja i autoryzacja
- Walidacja danych wejściowych
- Zabezpieczenia API
- Ochrona przed CSRF, XSS i SQL Injection

## 4. Scenariusze testowe

### 4.1. Autentykacja

#### Rejestracja nowego użytkownika
- Poprawna rejestracja z poprawnymi danymi
- Walidacja pól formularza (login, hasło)
- Obsługa duplikatów loginów
- Wymagania dotyczące siły hasła
- Obsługa błędów API podczas rejestracji

#### Logowanie
- Poprawne logowanie z prawidłowymi danymi
- Nieprawidłowe dane logowania (komunikaty błędów)
- Obsługa sesji i tokenów
- Wylogowanie i czyszczenie sesji
- Obsługa wygaśnięcia tokenu

#### Zarządzanie kontem
- Zmiana hasła
- Usunięcie konta
- Odzyskiwanie dostępu

### 4.2. Zarządzanie fiszkami

#### Tworzenie fiszek
- Ręczne tworzenie fiszek
- Generowanie przez AI
- Walidacja pól (front, back)
- Zapisywanie źródła pochodzenia fiszki (CardOrigin)

#### Edycja fiszek
- Modyfikacja zawartości (front, back)
- Zachowanie historii zmian (updated_at)
- Walidacja zmian
- Aktualizacja card_origin przy edycji

#### Usuwanie fiszek
- Pojedyncze usuwanie
- Masowe usuwanie
- Potwierdzenie usunięcia
- Obsługa błędów podczas usuwania

#### Przeglądanie fiszek
- Pobieranie listy fiszek
- Filtrowanie i sortowanie
- Paginacja wyników
- Widok szczegółowy fiszki

### 4.3. Integracja z AI

#### Generowanie fiszek
- Poprawność generowanych treści
- Obsługa błędów AI (OpenRouterError)
- Limity i throttling
- Jakość generowanych fiszek

#### Modyfikacja sugestii AI
- Edycja wygenerowanych fiszek
- Zachowanie źródła pochodzenia (zmiana na 'ai_modified')
- Walidacja zmodyfikowanych treści

## 5. Środowisko testowe

### 5.1. Konfiguracja środowiska

- Node.js v18+
- Astro 5
- TypeScript 5
- React 19
- Tailwind 4
- Shadcn/ui
- Supabase (lokalnie)

### 5.2. Wymagane narzędzia

- Vitest - testy jednostkowe
- Playwright - testy E2E
- MSW (Mock Service Worker) - mockowanie API
- Lighthouse - testy wydajności
- ESLint - statyczna analiza kodu
- Storybook - testowanie komponentów UI (opcjonalnie)

## 6. Narzędzia do testowania

### 6.1. Framework testowy

- Vitest dla testów jednostkowych i integracyjnych
- Playwright dla testów E2E
- React Testing Library dla testów komponentów
- Astro Testing Library dla testów komponentów Astro

### 6.2. Narzędzia pomocnicze

- TypeScript dla type-checkingu
- ESLint dla statycznej analizy
- Prettier dla formatowania kodu
- Husky dla git hooks
- MSW dla mockowania API
- GitHub Actions dla CI/CD

## 7. Harmonogram testów

### 7.1. Faza przygotowawcza (Sprint 0)

- Konfiguracja środowiska testowego
- Przygotowanie test fixtures i mocków
- Implementacja podstawowych helpers testowych
- Konfiguracja CI/CD dla testów

### 7.2. Fazy testów

1. Testy jednostkowe (ciągłe, przy każdym commit)
2. Testy integracyjne (co sprint, przed merge do głównego brancha)
3. Testy E2E (przed każdym release, na środowisku staging)
4. Testy wydajnościowe (co dwa sprinty)
5. Testy bezpieczeństwa (co kwartał)

## 8. Kryteria akceptacji

### 8.1. Pokrycie kodu

- Minimum 80% pokrycia dla kodu biznesowego
- Minimum 90% pokrycia dla krytycznych komponentów (autentykacja, API)
- 100% pokrycia dla walidacji i mechanizmów security
- Brak regresji w istniejących funkcjonalnościach

### 8.2. Wydajność

- Czas ładowania strony < 2s
- Time to Interactive < 3s
- First Contentful Paint < 1.5s
- Lighthouse score > 90
- Czas odpowiedzi API < 300ms (95 percentyl)

### 8.3. Jakość kodu

- Brak błędów ESLint
- Zgodność z TypeScript strict mode
- Brak warning w konsoli
- Zgodność z best practices React i Astro
- Poprawność typów DTO

## 9. Role i odpowiedzialności

### 9.1. QA Engineer

- Projektowanie i utrzymanie planu testów
- Implementacja testów automatycznych
- Raportowanie błędów
- Weryfikacja poprawek
- Monitoring jakości kodu

### 9.2. Developer

- Implementacja testów jednostkowych
- Code review
- Naprawianie błędów
- Utrzymanie jakości kodu
- Implementacja mechanizmów testability

### 9.3. Tech Lead

- Przegląd planu testów
- Ustalanie priorytetów
- Zatwierdzanie zmian w architekturze
- Monitoring jakości
- Decyzje dotyczące release'ów

## 10. Procedury raportowania błędów

### 10.1. Format zgłoszenia

- Tytuł (zwięzły i opisowy)
- Opis problemu
- Kroki reprodukcji (dokładna sekwencja)
- Oczekiwane zachowanie
- Aktualne zachowanie
- Środowisko (przeglądarka, system, wersja)
- Załączniki (screenshoty, logi, nagrania)
- Priorytet i severity

### 10.2. Priorytetyzacja

- P0: Krytyczny - blokuje działanie systemu, wymaga natychmiastowej reakcji
- P1: Wysoki - znacząco wpływa na UX, wymaga szybkiej naprawy
- P2: Średni - ograniczona funkcjonalność, do naprawy w najbliższym sprincie
- P3: Niski - kosmetyczne problemy, do naprawy przy okazji

### 10.3. Proces obsługi

1. Zgłoszenie błędu (GitHub Issues)
2. Triaging i analiza
3. Przypisanie developera
4. Implementacja poprawki
5. Code review
6. Testy poprawki
7. Deployment (na środowisko testowe, następnie produkcyjne)
8. Weryfikacja i zamknięcie zgłoszenia

## 11. Raportowanie i metryki

### 11.1. Raporty z testów

- Pokrycie kodu (trend w czasie)
- Liczba błędów (według priorytetu)
- Czas naprawy (średni, maksymalny)
- Stabilność testów (procent niestabilnych testów)
- Liczba regresji

### 11.2. Metryki wydajności

- Czas ładowania (po ścieżkach)
- Wykorzystanie zasobów (CPU, pamięć)
- Liczba requestów i ich rozmiar
- Rozmiar bundle (analiza treemap)
- Wskaźniki Core Web Vitals

### 11.3. Częstotliwość raportowania

- Dzienne: status testów automatycznych (CI dashboard)
- Tygodniowe: podsumowanie błędów i postępu
- Miesięczne: trendy i metryki jakościowe
- Kwartalne: przegląd jakości i audyt bezpieczeństwa

## 12. Strategia testów dostępności

### 12.1. Standardy dostępności
- Zgodność z WCAG 2.1 (poziom AA)
- Obsługa czytników ekranowych
- Nawigacja klawiaturowa
- Odpowiedni kontrast kolorów

### 12.2. Narzędzia do testów dostępności
- Axe DevTools
- Lighthouse Accessibility
- Testy manualne z czytnikami ekranowymi
- Testy z użytkownikami o różnych potrzebach

### 12.3. Proces testowania dostępności
- Automatyczne testy w CI/CD
- Okresowe audyty dostępności
- Włączenie testów dostępności w DoD