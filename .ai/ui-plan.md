# Architektura UI dla AI Flashcards

## 1. Przegląd struktury UI

W niniejszym dokumencie przedstawiono ogólny przegląd architektury interfejsu użytkownika dla aplikacji AI Flashcards. Projekt opiera się na oddzielnych widokach, intuicyjnej nawigacji oraz ścisłej integracji z backendem poprzez REST API. Priorytetem są responsywność, dostępność i bezpieczeństwo, przy jednoczesnym wykorzystaniu bibliotek takich jak Shadcn/ui oraz React Context do zarządzania stanem.

## 2. Lista widoków

### Widok Logowania
- **Ścieżka:** /login
- **Główny cel:** Umożliwić istniejącym użytkownikom uwierzytelnienie.
- **Kluczowe informacje:** Formularz logowania, komunikaty o błędach, link do rejestracji.
- **Kluczowe komponenty:** Formularz (pola wejściowe, przyciski), elementy walidacji inline.
- **UX, dostępność i bezpieczeństwo:** Wyraźne etykiety, responsywny układ, walidacja danych, integracja z mechanizmem JWT.

### Widok Rejestracji
- **Ścieżka:** /register
- **Główny cel:** Umożliwić nowym użytkownikom założenie konta.
- **Kluczowe informacje:** Formularz rejestracji, walidacja danych, komunikaty błędów.
- **Kluczowe komponenty:** Formularz (pola tekstowe, przyciski), link do logowania.
- **UX, dostępność i bezpieczeństwo:** Intuicyjny proces rejestracji, dostępność, walidacja po stronie klienta.

### Dashboard Użytkownika
- **Ścieżka:** /dashboard
- **Główny cel:** Prezentacja podsumowania konta oraz szybki dostęp do głównych funkcji aplikacji.
- **Kluczowe informacje:** Podsumowanie aktywności, informacje o użytkowniku, skróty do innych widoków.
- **Kluczowe komponenty:** Pasek nawigacyjny, karty informacyjne, przyciski akcji.
- **UX, dostępność i bezpieczeństwo:** Intuicyjna nawigacja, ochrona dostępu poprzez autoryzację, responsywność.

### Widok Flashcards
- **Ścieżka:** /flashcards
- **Główny cel:** Wyświetlanie listy wszystkich fiszek użytkownika.
- **Kluczowe informacje:** Lista fiszek, możliwość filtrowania, opcje edycji i usuwania.
- **Kluczowe komponenty:** Lista/karty, elementy interakcyjne (przyciski, ikony), paginacja.
- **UX, dostępność i bezpieczeństwo:** Czytelna prezentacja treści, filtrowanie i sortowanie, ograniczenie dostępu do danych użytkownika.

### Ekran Generowania Fiszek (AI)
- **Ścieżka:** /flashcards/generate
- **Główny cel:** Umożliwić generowanie sugestii fiszek przy użyciu mechanizmu AI.
- **Kluczowe informacje:** Formularz wprowadzania tekstu, przycisk uruchamiający generowanie, wskaźnik ładowania, komunikaty błędów (np. timeout, walidacja).
- **Kluczowe komponenty:** Textarea, przycisk, loader, elementy komunikatów inline.
- **UX, dostępność i bezpieczeństwo:** Natychmiastowa informacja zwrotna, walidacja danych wejściowych, zabezpieczenia przed XSS.

### Ekran Potwierdzania/Odrzucania Fiszek
- **Ścieżka:** /flashcards/confirmation
- **Główny cel:** Pozwolić użytkownikowi zatwierdzić lub odrzucić wygenerowaną fiszkę.
- **Kluczowe informacje:** Szczegóły wygenerowanej fiszki, przyciski akceptacji i odrzucenia, możliwość cofnięcia operacji.
- **Kluczowe komponenty:** Karta z treścią fiszki, przyciski (akceptacja/odrzucenie), alerty komunikatów.
- **UX, dostępność i bezpieczeństwo:** Jasny przekaz treści, intuicyjne elementy interakcyjne, bezpieczne przesyłanie decyzji do backendu.

## 3. Mapa podróży użytkownika

1. Użytkownik trafia na stronę logowania lub rejestracji.
2. Po uwierzytelnieniu/założeniu konta użytkownik zostaje przekierowany do dashboardu.
3. Z dashboardu użytkownik wybiera opcję przeglądania swoich fiszek lub generowania nowej fiszki.
4. W przypadku generowania fiszki, użytkownik przechodzi do ekranu generowania, wprowadza tekst, a aplikacja komunikuje się z REST API w celu otrzymania sugestii.
5. Otrzymana fiszka jest prezentowana na ekranie potwierdzania/odrzucania, gdzie użytkownik może zaakceptować lub odrzucić wynik.
6. Po zaakceptowaniu, fiszka trafia do widoku Flashcards, gdzie użytkownik może ją zobaczyć oraz zarządzać nią.
7. Użytkownik ma możliwość powrotu do poprzednich etapów w dowolnym momencie, co zwiększa elastyczność korzystania z aplikacji.

## 4. Układ i struktura nawigacji

- Główna nawigacja dostępna będzie jako pasek u góry strony, umożliwiający szybki dostęp do kluczowych widoków: Dashboard, Flashcards, Generowanie fiszek oraz ustawień konta.
- Menu będzie responsywne – na urządzeniach mobilnych zostanie przekształcone w menu rozwijane.
- Elementy nawigacyjne będą wyraźnie oznaczone, z wizualnym potwierdzeniem aktywnego widoku.
- System nawigacji zapewni możliwość cofania się do wcześniejszych widoków oraz szybkie przełączanie między funkcjami.

## 5. Kluczowe komponenty

- **Formularze:** Standaryzowane elementy wejściowe (Input, Textarea) oraz przyciski, oparte na Shadcn/ui, służące do wprowadzania danych.
- **Przyciski:** Komponenty akcji w różnych stanach (aktywne, nieaktywne, ładowanie).
- **Menu nawigacyjne:** Komponenty umożliwiające intuitacyjną nawigację między widokami.
- **Karty informacyjne:** Elementy prezentujące dane, takie jak szczegóły fiszek lub informacje użytkownika.
- **Alerty i komunikaty błędów:** Komponenty do wyświetlania informacji zwrotnych oraz komunikatów inline.
- **Loader:** Komponent wskazujący na operacje asynchroniczne, np. w trakcie generowania fiszek. 