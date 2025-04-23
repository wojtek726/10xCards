import { useState } from "react";
import type { GenerateFlashcardRequestDTO, GenerateFlashcardResponseDTO, CardOrigin } from "@/types";
import { InputForm } from "./InputForm";
import { FlashcardSuggestionCard } from "./FlashcardSuggestionCard";
import { InlineError } from "@/components/ui/inline-error";
import { Loader } from "@/components/ui/loader";

export const GenerowanieFiszkiView = () => {
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<GenerateFlashcardResponseDTO["suggested_flashcard"] | null>(null);

  const handleAuthError = () => {
    const currentPath = window.location.pathname;
    window.location.href = `/auth/login?redirectTo=${encodeURIComponent(currentPath)}`;
  };

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
          handleAuthError();
          return;
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

      const requestData = {
        front: suggestion.front,
        back: suggestion.back,
        card_origin: "ai" as CardOrigin,
      };
      
      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          handleAuthError();
          return;
        }
        if (response.status === 400) {
          const errorData = await response.json();
          throw new Error(errorData.error + (errorData.details ? ": " + JSON.stringify(errorData.details) : ""));
        }
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
    <div className="space-y-6" data-testid="flashcard-generation-view">
      <InputForm value={inputText} onChange={setInputText} onSubmit={handleGenerateFlashcard} disabled={loading} />

      {loading && <Loader visible={true} data-testid="generation-loader" />}

      {error && <InlineError message={error} data-testid="generation-error" />}

      {suggestion && (
        <FlashcardSuggestionCard
          suggestion={suggestion}
          onAccept={handleAcceptFlashcard}
          onReject={handleRejectFlashcard}
          disabled={loading}
          data-testid="flashcard-suggestion"
        />
      )}
    </div>
  );
};
