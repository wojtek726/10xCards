import { useState } from "react";
import type { GenerateFlashcardRequestDTO, GenerateFlashcardResponseDTO } from "@/types";
import { InputForm } from "./InputForm";
import { FlashcardSuggestionCard } from "./FlashcardSuggestionCard";
import { InlineError } from "@/components/ui/inline-error";
import { Loader } from "@/components/ui/loader";

export const GenerowanieFiszkiView = () => {
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<GenerateFlashcardResponseDTO["suggested_flashcard"] | null>(null);

  const handleGenerateFlashcard = async (text: string) => {
    try {
      setLoading(true);
      setError(null);
      setSuggestion(null);

      const response = await fetch("/api/flashcards/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input_text: text } as GenerateFlashcardRequestDTO),
      });

      if (!response.ok) {
        if (response.status === 400) {
          throw new Error("Nieprawidłowe dane wejściowe. Tekst musi mieć od 1 do 1000 znaków.");
        } else if (response.status === 401) {
          throw new Error("Brak autoryzacji. Zaloguj się ponownie.");
        } else if (response.status === 504) {
          throw new Error("Przekroczono czas oczekiwania na odpowiedź. Spróbuj ponownie.");
        }
        throw new Error("Wystąpił błąd podczas generowania fiszki. Spróbuj ponownie.");
      }

      const data: GenerateFlashcardResponseDTO = await response.json();
      setSuggestion(data.suggested_flashcard);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił nieznany błąd.");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptFlashcard = async () => {
    if (!suggestion) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          front: suggestion.front,
          back: suggestion.back,
          card_origin: "ai",
        }),
      });

      if (!response.ok) {
        throw new Error("Nie udało się zapisać fiszki. Spróbuj ponownie.");
      }

      // Reset stanu po pomyślnym zapisie
      setInputText("");
      setSuggestion(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił nieznany błąd.");
    } finally {
      setLoading(false);
    }
  };

  const handleRejectFlashcard = () => {
    setSuggestion(null);
  };

  return (
    <div className="space-y-6">
      <InputForm value={inputText} onChange={setInputText} onSubmit={handleGenerateFlashcard} disabled={loading} />

      {loading && <Loader visible={true} />}

      {error && <InlineError message={error} />}

      {suggestion && (
        <FlashcardSuggestionCard
          suggestion={suggestion}
          onAccept={handleAcceptFlashcard}
          onReject={handleRejectFlashcard}
          disabled={loading}
        />
      )}
    </div>
  );
};
