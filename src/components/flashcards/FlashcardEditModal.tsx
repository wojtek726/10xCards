import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { FlashcardDTO } from "@/types";

interface FlashcardEditModalProps {
  flashcard: FlashcardDTO | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (flashcard: { front: string; back: string }) => Promise<void>;
}

export function FlashcardEditModal({ flashcard, isOpen, onClose, onSave }: FlashcardEditModalProps) {
  const [front, setFront] = useState(flashcard?.front || "");
  const [back, setBack] = useState(flashcard?.back || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ front?: string; back?: string }>({});

  const validateForm = () => {
    const newErrors: { front?: string; back?: string } = {};
    
    if (front.length < 1) {
      newErrors.front = "Przód fiszki jest wymagany";
    } else if (front.length > 200) {
      newErrors.front = "Przód fiszki może mieć maksymalnie 200 znaków";
    }

    if (back.length < 1) {
      newErrors.back = "Tył fiszki jest wymagany";
    } else if (back.length > 500) {
      newErrors.back = "Tył fiszki może mieć maksymalnie 500 znaków";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({ front, back });
      onClose();
    } catch (error) {
      console.error("Błąd podczas zapisywania fiszki:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edytuj fiszkę</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="front">Przód fiszki</Label>
            <Textarea
              id="front"
              value={front}
              onChange={(e) => setFront(e.target.value)}
              placeholder="Wprowadź przód fiszki..."
              className={errors.front ? "border-destructive" : ""}
              data-testid="flashcard-front-input"
            />
            {errors.front && (
              <p className="text-sm text-destructive">{errors.front}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="back">Tył fiszki</Label>
            <Textarea
              id="back"
              value={back}
              onChange={(e) => setBack(e.target.value)}
              placeholder="Wprowadź tył fiszki..."
              className={errors.back ? "border-destructive" : ""}
              data-testid="flashcard-back-input"
            />
            {errors.back && (
              <p className="text-sm text-destructive">{errors.back}</p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Anuluj
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              data-testid="save-flashcard-button"
            >
              {isSubmitting ? "Zapisywanie..." : "Zapisz"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 