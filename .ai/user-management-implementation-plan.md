# Plan implementacji zarządzania kontem użytkownika

## Wymagania z PRD
Na podstawie PRD wymagane jest zaimplementowanie następujących funkcjonalności zarządzania kontem użytkownika:

1. Edycja hasła (część US-003)
2. Usuwanie konta użytkownika (część US-003)
3. Usuwanie wszystkich powiązanych danych użytkownika podczas usuwania konta (fiszki)
4. Każdy użytkownik posiada swoje indywidualne fiszki (zgodnie z US-003)

## Komponenty UI

### Strona profilu użytkownika
Nowa strona, która będzie zawierać:
- Sekcję informacji o koncie (login, data utworzenia)
- Formularz zmiany hasła
- Sekcję "Danger Zone" z opcją usunięcia konta

#### Formularze i komponenty
1. **Formularz zmiany hasła**
   - Pole na aktualne hasło
   - Pole na nowe hasło
   - Pole na potwierdzenie nowego hasła
   - Przycisk potwierdzenia
   - Walidacja bezpieczeństwa hasła
   - Komunikaty o błędach

2. **Dialog potwierdzenia usunięcia konta**
   - Ostrzeżenie o nieodwracalności operacji
   - Pole do wpisania hasła jako potwierdzenie
   - Przyciski Anuluj/Usuń konto

### Modyfikacje istniejących komponentów
1. **Navbar**
   - Dodanie opcji "Profil" w menu użytkownika w prawym górnym rogu (zgodnie z UI-plan)

## Struktura komponentów

```
src/
├── pages/
│   └── profile/
│       ├── index.astro      # Strona profilu użytkownika
│       └── delete.astro     # Strona potwierdzenia usunięcia konta
├── components/
│   └── profile/
│       ├── PasswordChangeForm.tsx  # Formularz zmiany hasła
│       └── DeleteAccount.tsx       # Komponent potwierdzenia usunięcia konta
```

## API Endpoints

### 1. Zmiana hasła
```
PUT /auth/password
```
**Wymagane dane:**
- currentPassword
- newPassword

**Odpowiedzi:**
- 200 OK: Hasło zostało zmienione
- 400 Bad Request: Błąd walidacji
- 401 Unauthorized: Niepoprawne aktualne hasło
- 500 Internal Server Error: Błąd serwera

### 2. Usunięcie konta
```
DELETE /auth/account
```
**Wymagane dane:**
- password (potwierdzenie)

**Odpowiedzi:**
- 200 OK: Konto zostało usunięte
- 401 Unauthorized: Niepoprawne hasło
- 500 Internal Server Error: Błąd serwera

## Modyfikacje bazy danych
### Supabase Row Level Security
- Wykorzystanie Row Level Security (RLS) w Supabase do zabezpieczenia dostępu do danych
- Konfiguracja polityk RLS dla tabeli flashcards z cascading delete (ON DELETE CASCADE)
- Zapewnienie, że użytkownik ma dostęp tylko do swoich fiszek

### Walidacja hasła
- Sprawdzanie bezpieczeństwa hasła podczas aktualizacji (min. 8 znaków)
- Wykorzystanie funkcji haszowania w Supabase do bezpiecznego przechowywania haseł

## Serwisy
### Rozszerzenie AuthService
1. **Metoda zmiany hasła**
   ```typescript
   async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean>
   ```

2. **Metoda usunięcia konta**
   ```typescript
   async deleteAccount(userId: string, password: string): Promise<boolean>
   ```

### Integracja z Supabase
```typescript
// Przykładowa implementacja w AuthService
import { supabaseClient } from '@/db/supabase.client';

async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
  // Weryfikacja aktualnego hasła
  const { error: signInError } = await supabaseClient.auth.signInWithPassword({
    email: userEmail, // pobrane wcześniej
    password: currentPassword
  });
  
  if (signInError) return false;
  
  // Aktualizacja hasła
  const { error } = await supabaseClient.auth.updateUser({
    password: newPassword
  });
  
  return !error;
}

async deleteAccount(userId: string, password: string): Promise<boolean> {
  // Weryfikacja hasła
  const { error: signInError } = await supabaseClient.auth.signInWithPassword({
    email: userEmail, // pobrane wcześniej
    password: password
  });
  
  if (signInError) return false;
  
  // Usunięcie konta
  const { error } = await supabaseClient.auth.admin.deleteUser(userId);
  // Fiszki zostaną usunięte automatycznie dzięki ON DELETE CASCADE
  
  return !error;
}
```

## Plan implementacji

### Etap 1: Przygotowanie infrastruktury Supabase
1. Konfiguracja Row Level Security (RLS) w Supabase
2. Utworzenie polityk dostępu do danych
3. Konfiguracja kaskadowego usuwania danych (ON DELETE CASCADE)

### Etap 2: Przygotowanie API
1. Implementacja endpointów API
   - `PUT /auth/password`
   - `DELETE /auth/account`
2. Rozszerzenie AuthService o nowe metody
3. Integracja z Supabase Auth

### Etap 3: Implementacja komponentów UI
1. Stworzenie strony profilu użytkownika (`/profile`)
2. Implementacja formularza zmiany hasła (PasswordChangeForm.tsx)
3. Implementacja dialogu potwierdzenia usunięcia konta (DeleteAccount.tsx)
4. Aktualizacja Navbar o nową opcję "Profil"

### Etap 4: Integracja i testowanie
1. Połączenie UI z API
2. Testowanie przypadków brzegowych (np. niepoprawne hasło, błędy serwera)
3. Testy e2e dla głównych przypadków użycia

## Testy
### Testy jednostkowe
1. Testy dla AuthService
   - Zmiana hasła z poprawnymi danymi
   - Zmiana hasła z niepoprawnym obecnym hasłem
   - Usunięcie konta z poprawnym hasłem
   - Usunięcie konta z niepoprawnym hasłem

2. Testy dla komponentów React
   - Renderowanie formularza zmiany hasła
   - Renderowanie dialogu usunięcia konta
   - Walidacja formularzy
   - Obsługa przesyłania formularzy

### Testy e2e
1. Scenariusze zmiany hasła
   - Scenariusz pozytywny
   - Scenariusz z niepoprawnym obecnym hasłem
   - Scenariusz z hasłem niespełniającym wymogów bezpieczeństwa

2. Scenariusze usunięcia konta
   - Scenariusz pozytywny (potwierdzenie usunięcia wszystkich danych)
   - Scenariusz z niepoprawnym hasłem

## Kolejność implementacji
1. Konfiguracja Supabase (RLS, zasady dostępu)
2. Implementacja API Endpoints i rozszerzenie AuthService
3. Utworzenie strony profilu i podstawowego układu
4. Implementacja formularza zmiany hasła
5. Implementacja dialogu usuwania konta
6. Integracja UI z API
7. Testy
8. Weryfikacja zgodności z wymaganiami 