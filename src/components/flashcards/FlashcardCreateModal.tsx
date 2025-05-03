import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface FlashcardCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (flashcard: { front: string; back: string }) => Promise<void>;
}

export function FlashcardCreateModal({ isOpen, onClose, onCreate }: FlashcardCreateModalProps) {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
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
      await onCreate({ front, back });
      setFront("");
      setBack("");
      onClose();
    } catch (error) {
      console.error("Błąd podczas tworzenia fiszki:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFront("");
    setBack("");
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dodaj nową fiszkę</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6" data-testid="flashcard-form">
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
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Anuluj
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              data-testid="save-flashcard-button"
            >
              {isSubmitting ? "Tworzenie..." : "Dodaj"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 