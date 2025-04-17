# Baza Danych PostgreSQL - Schemat dla MVP AI Flashcards

## 1. Tabele

### 1.1. Tabela: users
- **id**: UUID, PRIMARY KEY, DEFAULT gen_random_uuid()  -- Upewnij się, że rozszerzenie pgcrypto jest aktywowane (`CREATE EXTENSION IF NOT EXISTS pgcrypto;`)
- **login**: VARCHAR(32), NOT NULL, UNIQUE
- **hash_password**: VARCHAR(255), NOT NULL
- **created_at**: TIMESTAMP WITH TIME ZONE, NOT NULL, DEFAULT CURRENT_TIMESTAMP
- **updated_at**: TIMESTAMP WITH TIME ZONE, NOT NULL, DEFAULT CURRENT_TIMESTAMP

### 1.2. Tabela: flashcards
- **id**: UUID, PRIMARY KEY, DEFAULT gen_random_uuid()
- **user_id**: UUID, NOT NULL, REFERENCES users(id) ON DELETE CASCADE
- **front**: VARCHAR(200) NOT NULL
- **back**: VARCHAR(500) NOT NULL
- **card_origin**: card_origin_enum, NOT NULL  -- ENUM z wartościami: 'manual', 'ai', 'ai_modified'
- **created_at**: TIMESTAMP WITH TIME ZONE, NOT NULL, DEFAULT CURRENT_TIMESTAMP
- **updated_at**: TIMESTAMP WITH TIME ZONE, NOT NULL, DEFAULT CURRENT_TIMESTAMP

## 2. Typ Custom ENUM
```sql
CREATE TYPE card_origin_enum AS ENUM ('manual', 'ai', 'ai_modified');
```
*(Wykonaj powyższą komendę przed utworzeniem tabeli flashcards)*

## 3. Relacje
- Relacja 1:N między tabelą `users` a `flashcards`: jeden użytkownik może posiadać wiele fiszek.
- Klucz obcy `flashcards.user_id` odnosi się do `users.id` z opcją ON DELETE CASCADE.

## 4. Indeksy
- Indeks unikalny na `users.login` (tworzony automatycznie przez ograniczenie UNIQUE).
- Indeks na `flashcards.user_id`:
```sql
CREATE INDEX idx_flashcards_user_id ON flashcards(user_id);
```

## 5. Zasady RLS (Row Level Security)
Dla tabeli `flashcards`:
```sql
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;

-- Przykładowa polityka RLS, zakładająca, że aplikacja ustawia parametr sesji 'app.current_user_id'
CREATE POLICY flashcards_rls_policy ON flashcards
    USING (user_id = current_setting('app.current_user_id')::uuid);
```
*(Upewnij się, że aplikacja ustawia parametr `app.current_user_id` dla sesji użytkownika)*

## 6. Dodatkowe Uwagi
- **Ograniczenia CHECK:** Długość pól (login, front, back) jest kontrolowana przez deklarację typu VARCHAR z odpowiednimi limitami.
- **Automatyczna Aktualizacja updated_at:** Aktualizacja kolumny updated_at przy modyfikacjach nie jest automatyczna. Można rozważyć dodanie triggera w przyszłości.
- **Szyfrowanie Haseł:** Hasła są przechowywane w postaci zahashowanej przy użyciu funkcji PostgreSQL (np. pgcrypto), co upraszcza implementację mechanizmów bezpieczeństwa.
- **Normalizacja:** Schemat jest zgodny z 3NF, z jasno zdefiniowanymi relacjami między tabelami. 