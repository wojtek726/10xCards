import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { GenerateFlashcardResponseDTO } from "@/types";

interface FlashcardSuggestionCardProps {
  suggestion: GenerateFlashcardResponseDTO["suggested_flashcard"];
  onAccept: () => void;
  onReject: () => void;
  disabled?: boolean;
}

export const FlashcardSuggestionCard = ({ suggestion, onAccept, onReject, disabled }: FlashcardSuggestionCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Wygenerowana fiszka</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="font-medium">Przód fiszki:</h3>
          <div className="rounded-lg bg-muted p-4">{suggestion.front}</div>
        </div>
        <div className="space-y-2">
          <h3 className="font-medium">Tył fiszki:</h3>
          <div className="rounded-lg bg-muted p-4">{suggestion.back}</div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-4">
        <Button variant="outline" onClick={onReject} disabled={disabled} type="button">
          Odrzuć
        </Button>
        <Button onClick={onAccept} disabled={disabled} type="button">
          Akceptuj
        </Button>
      </CardFooter>
    </Card>
  );
};
