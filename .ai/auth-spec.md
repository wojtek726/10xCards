# Specyfikacja Techniczna Systemu Autentykacji

## 1. Architektura Interfejsu Użytkownika

### 1.1 Struktura Komponentów

#### Strony Astro (Server-Side):
```
src/
├── pages/
│   ├── auth/
│   │   ├── login.astro        # Strona logowania
│   │   ├── signup.astro       # Strona rejestracji
│   │   ├── callback.astro     # Obsługa callback'ów Supabase
│   │   └── reset-password.astro # Resetowanie hasła
│   └── profile/
│       └── delete.astro       # Usuwanie konta
```

#### Komponenty React (Client-Side):
```
src/
├── components/
│   ├── auth/
│   │   ├── SignInForm.tsx     # Formularz logowania
│   │   ├── SignUpForm.tsx     # Formularz rejestracji
│   │   ├── ResetPasswordForm.tsx # Formularz resetowania hasła
│   │   └── AuthHeader.tsx     # Nagłówek z przyciskami auth (prawy górny róg)
│   └── profile/
│       └── DeleteAccount.tsx  # Potwierdzenie usunięcia konta
```

#### Layouty:
```
src/
└── layouts/
    ├── MainLayout.astro       # Layout główny z przyciskami auth w prawym górnym rogu
    └── ProtectedLayout.astro  # Layout dla chronionych stron
```

### 1.2 Przepływy Użytkownika

#### 1. Rejestracja:
- Formularz wymaga:
  - Email (unikalny)
  - Hasło (min. 8 znaków)
- Walidacja w czasie rzeczywistym
- Po sukcesie: przekierowanie do logowania
- Obsługa błędów:
  - Email zajęty
  - Hasło za słabe

#### 2. Logowanie:
- Formularz wymaga:
  - Email
  - Hasło
- Po sukcesie: przekierowanie do ostatniej strony
- Obsługa błędów:
  - Nieprawidłowe dane
  - Problemy z połączeniem

#### 3. Zarządzanie Kontem:
- Zmiana hasła
- Resetowanie zapomnianego hasła
- Usuwanie konta (z potwierdzeniem)
- Wylogowanie przez przycisk w prawym górnym rogu

### 1.3 Walidacja i Komunikaty

#### Walidacja Client-Side:
```typescript
const emailRules = {
  required: "Email jest wymagany",
  pattern: { 
    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, 
    message: "Nieprawidłowy format email" 
  }
};

const passwordRules = {
  required: "Hasło jest wymagane",
  minLength: { value: 8, message: "Min. 8 znaków" }
};
```

#### Komunikaty Błędów:
- Wyświetlane pod polami formularza
- Obsługa stanu ładowania (przyciski)

## 2. Logika Backendowa

### 2.1 Model Danych

#### Tabela users (Supabase):
```sql
create table public.users (
  id uuid references auth.users primary key,
  email text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table public.users enable row level security;

create policy "Users can read own profile"
  on public.users for select
  using ( auth.uid() = id );

create policy "Users can update own profile"
  on public.users for update
  using ( auth.uid() = id );
```

### 2.2 Endpointy API

#### Supabase Auth:
```typescript
interface AuthEndpoints {
  '/auth/signup': {
    POST: {
      body: { email: string; password: string; }
      response: { user: User; session: Session; }
    }
  }
  '/auth/signin': {
    POST: {
      body: { email: string; password: string; }
      response: { session: Session; }
    }
  }
  '/auth/reset-password': {
    POST: {
      body: { email: string; }
      response: { success: boolean; }
    }
  }
  '/auth/signout': {
    POST: {
      response: { success: boolean; }
    }
  }
}
```

#### Astro Endpoints:
```typescript
// src/pages/api/auth/account.ts
interface AccountEndpoints {
  '/api/auth/account': {
    DELETE: {
      response: { success: boolean; }
    }
  }
}
```

### 2.3 Middleware

```typescript
// src/middleware/auth.ts
export const protectedRoutes = [
  '/flashcards/collections'  // Zgodnie z US-008
];

export const authMiddleware = defineMiddleware(async ({ request, redirect }) => {
  const session = await getSession();
  const path = new URL(request.url).pathname;
  
  if (!session && protectedRoutes.some(route => path.startsWith(route))) {
    return redirect('/auth/login');
  }
});
```

## 3. System Autentykacji

### 3.1 Serwisy

#### AuthService:
```typescript
interface AuthService {
  signUp(email: string, password: string): Promise<AuthResponse>;
  signIn(email: string, password: string): Promise<AuthResponse>;
  resetPassword(email: string): Promise<void>;
  signOut(): Promise<void>;
  deleteAccount(): Promise<void>;
  getSession(): Promise<Session | null>;
}
```

### 3.2 Integracja z Astro

#### Kontekst Użytkownika:
```typescript
// src/env.d.ts
declare namespace App {
  interface Locals {
    user?: User;
    session?: Session;
  }
}
```

### 3.3 Bezpieczeństwo

#### Zabezpieczenia:
1. Row Level Security w Supabase
2. CSRF Protection
3. Rate Limiting dla endpointów auth
4. Secure Headers

#### Obsługa Błędów:
```typescript
const errorHandler = {
  AUTH_INVALID_CREDENTIALS: "Nieprawidłowy email lub hasło",
  AUTH_USER_NOT_FOUND: "Użytkownik nie istnieje",
  AUTH_WEAK_PASSWORD: "Hasło nie spełnia wymagań bezpieczeństwa",
  AUTH_INVALID_EMAIL: "Nieprawidłowy format adresu email"
};
```

## 4. Wdrożenie

### 4.1 Zależności
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.x",
    "@supabase/auth-helpers-astro": "^1.x",
    "zod": "^3.x",
    "react-hook-form": "^7.x"
  }
}
```

### 4.2 Zmienne Środowiskowe
```env
PUBLIC_SUPABASE_URL=xxx
PUBLIC_SUPABASE_ANON_KEY=xxx
SITE_URL=http://localhost:4321
```

### 4.3 Kolejność Wdrożenia
1. Konfiguracja Supabase (tabele, RLS)
2. Implementacja AuthService
3. Komponenty React (formularze)
4. Strony Astro i middleware
5. Integracja z głównym layoutem (przyciski auth)
6. Testy bezpieczeństwa
7. Dokumentacja 

<mermaid_diagram>
```mermaid
flowchart TD
    %% Style definitions
    classDef page fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef component fill:#fff3e0,stroke:#ff6f00,stroke-width:2px
    classDef layout fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef service fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    classDef middleware fill:#fbe9e7,stroke:#bf360c,stroke-width:2px

    %% Main Layout and Auth Header
    subgraph Layout["Layouts"]
        MainLayout["MainLayout.astro\n(Główny layout)"]
        ProtectedLayout["ProtectedLayout.astro\n(Chronione strony)"]
        AuthHeader["AuthHeader.tsx\n(Przyciski logowania)"]
    end

    %% Auth Pages
    subgraph Pages["Strony Astro"]
        Login["login.astro\n(Logowanie)"]
        Signup["signup.astro\n(Rejestracja)"]
        ResetPwd["reset-password.astro\n(Reset hasła)"]
        Callback["callback.astro\n(Obsługa auth)"]
        Delete["delete.astro\n(Usuwanie konta)"]
    end

    %% React Components
    subgraph Components["Komponenty React"]
        SignInForm["SignInForm.tsx\n(Formularz logowania)"]
        SignUpForm["SignUpForm.tsx\n(Formularz rejestracji)"]
        ResetForm["ResetPasswordForm.tsx\n(Formularz resetu)"]
        DeleteForm["DeleteAccount.tsx\n(Usuwanie konta)"]
    end

    %% Services and Middleware
    subgraph Backend["Backend"]
        AuthService["AuthService\n(Obsługa auth)"]
        AuthMiddleware["Middleware\n(Ochrona tras)"]
    end

    %% Connections
    MainLayout --> AuthHeader
    MainLayout --> Pages
    ProtectedLayout --> AuthMiddleware
    
    Login --> SignInForm
    Signup --> SignUpForm
    ResetPwd --> ResetForm
    Delete --> DeleteForm

    SignInForm --> AuthService
    SignUpForm --> AuthService
    ResetForm --> AuthService
    DeleteForm --> AuthService

    AuthService --> Callback
    AuthMiddleware --> AuthService

    %% Styles
    style Layout fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    style Pages fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    style Components fill:#fff3e0,stroke:#ff6f00,stroke-width:2px
    style Backend fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
</mermaid_diagram>