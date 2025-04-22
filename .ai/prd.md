# Dokument wymagań produktu (PRD) - AI Flashcards

## 1. Przegląd produktu
Ten dokument definiuje wymagania dla aplikacji AI Flashcards, która ma ułatwić tworzenie wysokiej jakości fiszek edukacyjnych. Aplikacja wykorzystuje AI do automatycznego generowania fiszek na podstawie dostarczonego tekstu, ale umożliwia również ręczne tworzenie oraz zarządzanie fiszkami. Aplikacja jest przeznaczona na platformę webową i ma być prostym rozwiązaniem na zaliczenie kursu, realizowanym przez jedną osobę.

## 2. Problem użytkownika
Ręczne tworzenie fiszek edukacyjnych jest czasochłonne i wymaga dużego zaangażowania, co negatywnie wpływa na efektywność nauki metodą spaced repetition. Użytkownicy rezygnują z tworzenia fiszek ze względu na zbyt duże wymagania w zakresie ręcznej edycji, co utrudnia systematyczną naukę.

## 3. Wymagania funkcjonalne
1. AI Flashcards Generator (US-001)
   - Opis: Użytkownik wprowadza tekst (kopiuj-wklej), a system generuje fiszkę z dwoma stronami (przód i tył). Fiszka musi zawierać prawdziwe, naukowo zgodne informacje.
   - Kryteria akceptacji:
     a. Po wprowadzeniu tekstu, system generuje fiszkę.
     b. Użytkownik może ocenić wygenerowaną fiszkę (akceptacja/odrzucenie).
     c. W przypadku akceptacji, zawartość fiszki zostaje zapisana wraz ze znacznikami czasu; odrzucona fiszka nie może być przywrócona.

2. Manualne tworzenie fiszek (US-002)
   - Opis: Użytkownik ma możliwość ręcznego tworzenia fiszek poprzez interfejs umożliwiający dodanie przodu i tyłu fiszki.
   - Kryteria akceptacji:
     a. Użytkownik może utworzyć nową fiszkę korzystając z przycisku "Dodaj nową fiszkę".
     b. Użytkownik może edytować i usuwać istniejące fiszki.

3. Zarządzanie kontem użytkownika (US-003)
   - Opis: Użytkownik może zarejestrować konto, zalogować się, zmienić hasło oraz usunąć swoje konto, korzystając wyłącznie z loginu i hasła.
   - Kryteria akceptacji:
     a. Proces rejestracji wymaga podania loginu i hasła.
     b. Użytkownik może zalogować się przy użyciu swoich poświadczeń.
     c. Użytkownik ma możliwość zmiany hasła oraz usunięcia konta.

4. Integracja z algorytmem powtórek (US-004)
   - Opis: Akceptowane fiszki są integrowane z open-source'owym algorytmem powtórek, co umożliwia systematyczne powtarzanie materiału edukacyjnego.
   - Kryteria akceptacji:
     a. Po akceptacji fiszki, jej zawartość oraz znaczniki czasu są przekazywane do modułu powtórek.
     b. Algorytm powtórek wykorzystuje przekazane dane do generowania harmonogramu powtórek.

5. Logowanie działań i monitorowanie (US-005)
   - Opis: System rejestruje wszystkie działania użytkownika związane z tworzeniem i weryfikacją fiszek, w tym akceptację fiszek, wraz z informacjami o czasie.
   - Kryteria akceptacji:
     a. System zapisuje zawartość zaakceptowanych fiszek wraz ze znacznikami czasu.
     b. Statystyki dotyczące liczby zaakceptowanych fiszek są dostępne do dalszej analizy.

6. Odrzucenie fiszki (US-006)
   - Opis: Użytkownik ma możliwość odrzucenia fiszki wygenerowanej przez AI, jeśli jej treść nie spełnia oczekiwań.
   - Kryteria akceptacji:
     a. Użytkownik może odrzucić fiszkę natychmiast po jej wygenerowaniu.
     b. Odrzucona fiszka nie może być przywrócona ani edytowana.

## 4. Granice produktu
- W zakres MVP wchodzi:
   a. Generowanie fiszek przez AI na podstawie tekstu.
   b. Manualne tworzenie fiszek.
   c. Możliwość przeglądania, edycji i usuwania fiszek.
   d. Prosty system kont użytkowników (login i hasło).
   e. Integracja fiszek z gotowym algorytmem powtórek.
- Poza zakresem MVP nie znajdują się:
   a. Zaawansowany algorytm powtórek (np. SuperMemo, Anki).
   b. Import wielu formatów (PDF, DOCX, itp.).
   c. Współdzielenie fiszek między użytkownikami.
   d. Integracje z innymi platformami edukacyjnymi.
   e. Aplikacje mobilne (projekt dotyczy wyłącznie platformy webowej).

## 5. Historyjki użytkowników
US-001: Generowanie fiszek przez AI
- Tytuł: Automatyczne generowanie fiszek
- Opis: Jako użytkownik chcę wprowadzić tekst do aplikacji i otrzymać wygenerowaną fiszkę, abym mógł szybko uzyskać nowe materiały do nauki.
- Kryteria akceptacji:
   a. Po wprowadzeniu tekstu system generuje fiszkę składającą się z przodu i tyłu.
   b. Fiszka zawiera informacje zgodne z nauką i nie zawiera wymyślonych treści.
   c. Użytkownik może zaakceptować lub odrzucić wygenerowaną fiszkę bez możliwości cofnięcia odrzucenia.

US-002: Manualne tworzenie fiszek
- Tytuł: Tworzenie fiszki ręcznie
- Opis: Jako użytkownik chcę móc ręcznie tworzyć fiszki, wprowadzając zarówno przód, jak i tył fiszki, aby mieć pełną kontrolę nad treścią.
- Kryteria akceptacji:
   a. Użytkownik może dodać nową fiszkę za pomocą przycisku "Dodaj nową fiszkę".
   b. Użytkownik może edytować i usuwać istniejące fiszki.

US-003: Zarządzanie kontem użytkownika
- Tytuł: Rejestracja, logowanie i zarządzanie kontem
- Opis: Jako użytkownik chcę zarejestrować konto, zalogować się, zmienić hasło oraz usunąć konto, aby móc bezpiecznie korzystać z aplikacji. Kazdy uzytkownik ma swoje indywidualne fiszki.
- Kryteria akceptacji:
   a. Proces rejestracji wymaga podania unikalnego loginu i hasła.
   b. Użytkownik może zalogować się przy użyciu swoich poświadczeń.
   c. Użytkownik ma możliwość zmiany hasła oraz usunięcia konta.

US-004: Integracja z algorytmem powtórek
- Tytuł: Powtórki fiszek
- Opis: Jako użytkownik chcę, aby zaakceptowane fiszki były integrowane z algorytmem powtórek, aby systematycznie powtarzać materiał edukacyjny.
- Kryteria akceptacji:
   a. Po akceptacji fiszki jej zawartość i znaczniki czasu są przekazywane do modułu powtórek.
   b. Algorytm generuje harmonogram powtórek bazując na przesłanych danych.

US-005: Logowanie działań użytkownika
- Tytuł: Rejestracja akcji użytkownika
- Opis: Jako analityk chcę, aby system rejestrował wszystkie akcje użytkownika (np. akceptację fiszek), aby móc analizować skuteczność produktu.
- Kryteria akceptacji:
   a. System zapisuje zawartość zaakceptowanych fiszek wraz ze znacznikami czasu.
   b. Rejestrowane są statystyki dotyczące liczby zaakceptowanych fiszek.

US-006: Odrzucenie fiszki
- Tytuł: Odrzucanie fiszek generowanych przez AI
- Opis: Jako użytkownik chcę móc odrzucić fiszkę wygenerowaną przez AI, jeśli jej treść nie spełnia moich oczekiwań, aby zachować jedynie wartościowe informacje.
- Kryteria akceptacji:
   a. Użytkownik ma możliwość natychmiastowego odrzucenia fiszki po jej wygenerowaniu.
   b. Odrzucona fiszka nie może być przywrócona ani edytowana.

US-007: Kolekcje reguł
- Tytuł: Kolekcje reguł
- Opis: Jako użytkownik chcę móc zapisywać i edytować zestawy reguł, aby szybko wykorzystywać sprawdzone rozwiązania w różnych projektach.
- Kryteria akceptacji:
  - Użytkownik może zapisać aktualny zestaw reguł (US-001) jako kolekcję (nazwa, opis, reguły).
  - Użytkownik może aktualizować kolekcję.
  - Użytkownik może usunąć kolekcję.
  - Użytkownik może przywrócić kolekcję do poprzedniej wersji (pending changes).
  - Funkcjonalność kolekcji nie jest dostępna bez logowania się do systemu (US-004).

US-008: Bezpieczny dostęp i uwierzytelnianie
- Tytuł: Bezpieczny dostęp
- Opis: Jako użytkownik chcę mieć możliwość rejestracji i logowania się do systemu w sposób zapewniający bezpieczeństwo moich danych.
- Kryteria akceptacji:
  - Logowanie i rejestracja odbywają się na dedykowanych stronach.
  - Logowanie wymaga podania adresu email i hasła.
  - Rejestracja wymaga podania adresu email, hasła i potwierdzenia hasła.
  - Użytkownik MOŻE korzystać z tworzenia reguł "ad-hoc" bez logowania się do systemu (US-001).
  - Użytkownik NIE MOŻE korzystać z funkcji Kolekcji bez logowania się do systemu (US-003).
  - Użytkownik może logować się do systemu poprzez przycisk w prawym górnym rogu.
  - Użytkownik może się wylogować z systemu poprzez przycisk w prawym górnym rogu w głównym @Layout.astro.
  - Nie korzystamy z zewnętrznych serwisów logowania (np. Google, GitHub).
  - Odzyskiwanie hasła powinno być możliwe.

## 6. Metryki sukcesu
1. Co najmniej 75% fiszek generowanych przez AI zostaje zaakceptowanych przez użytkownika.
2. Użytkownicy tworzą 75% fiszek przy użyciu funkcji generowania przez AI.
3. System poprawnie rejestruje zawartość zaakceptowanych fiszek oraz znaczniki czasu.
4. Analiza statystyk akceptacji umożliwia ocenę skuteczności generowanych treści. 