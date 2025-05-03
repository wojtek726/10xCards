# Wytyczne dotyczące testów E2E

## Struktura testów

1. **Tagowanie testów**
   - `@smoke` - podstawowe testy funkcjonalności
   - `@critical` - testy kluczowych funkcji biznesowych
   - `@regression` - pełne testy regresji

2. **Organizacja plików**
   - Jeden plik specyfikacji na funkcjonalność
   - Page Objects w katalogu `page-objects`
   - Mocki w katalogu `mocks`
   - Fixtures w katalogu `fixtures`

## Kryteria dodawania nowych testów

1. **Kiedy dodawać nowe testy**
   - Nowa funkcjonalność biznesowa
   - Naprawa krytycznego błędu
   - Pokrycie luki w istniejących testach

2. **Wymagania dla nowych testów**
   - Muszą być otagowane odpowiednim znacznikiem
   - Muszą używać Page Object Pattern
   - Muszą być niezależne od innych testów
   - Muszą być deterministyczne

## Utrzymanie testów

1. **Regularne przeglądy**
   - Cotygodniowy przegląd failed testów
   - Miesięczny przegląd wydajności testów
   - Kwartalna aktualizacja smoke testów

2. **Monitorowanie**
   - Śledzenie czasu wykonania testów
   - Monitorowanie stabilności testów
   - Analiza pokrycia testami

3. **Aktualizacje**
   - Regularna aktualizacja zależności
   - Przegląd i aktualizacja mocków
   - Optymalizacja czasów wykonania

## Best Practices

1. **Selektory**
   - Używaj data-testid dla elementów testowych
   - Unikaj selektorów CSS
   - Preferuj role i dostępne atrybuty

2. **Asercje**
   - Używaj jasnych i konkretnych asercji
   - Sprawdzaj stan końcowy, nie implementację
   - Unikaj zbyt wielu asercji w jednym teście

3. **Wydajność**
   - Współdziel stan autentykacji między testami
   - Używaj mocków dla zewnętrznych zależności
   - Minimalizuj interakcje z UI

## Proces przeglądu testów

1. **Code Review**
   - Sprawdź zgodność z wytycznymi
   - Zweryfikuj stabilność testu
   - Oceń wartość biznesową

2. **Dokumentacja**
   - Aktualizuj README po zmianach
   - Dokumentuj znane problemy
   - Utrzymuj aktualną dokumentację Page Objects 