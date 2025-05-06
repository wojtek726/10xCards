import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import type { FlashcardDTO } from "@/types";
import { motion } from "framer-motion";
import { forwardRef } from "react";

type CardOrigin = 'ai' | 'ai_modified' | 'manual';

interface FlashcardCardProps {
  flashcard: FlashcardDTO;
  onEdit: (flashcard: FlashcardDTO) => void;
  onDelete: (flashcard: FlashcardDTO) => void;
}

export const FlashcardCard = forwardRef<HTMLDivElement, FlashcardCardProps>(
  ({ flashcard, onEdit, onDelete }, ref) => {
    const getOriginBadgeVariant = (origin: CardOrigin) => {
      switch (origin) {
        case 'ai':
          return 'default';
        case 'ai_modified':
          return 'secondary';
        case 'manual':
          return 'outline';
        default:
          return 'default';
      }
    };

    const getOriginLabel = (origin: CardOrigin) => {
      switch (origin) {
        case 'ai':
          return 'AI';
        case 'ai_modified':
          return 'AI (zmodyfikowane)';
        case 'manual':
          return 'Ręcznie';
        default:
          return 'AI';
      }
    };

    return (
      <motion.div
        ref={ref}
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
        className="p-6 bg-card rounded-lg shadow-sm border relative"
        data-testid="flashcard-item"
      >
        <div className="absolute top-4 right-4 flex gap-2">
          <Badge variant={getOriginBadgeVariant(flashcard.card_origin as CardOrigin)}>
            {getOriginLabel(flashcard.card_origin as CardOrigin)}
          </Badge>
        </div>
        
        <div className="mb-4">
          <h3 className="font-semibold text-lg mb-2">Przód</h3>
          <p className="text-muted-foreground" data-testid="flashcard-front">{flashcard.front}</p>
        </div>
        
        <div>
          <h3 className="font-semibold text-lg mb-2">Tył</h3>
          <p className="text-muted-foreground" data-testid="flashcard-back">{flashcard.back}</p>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Utworzono: {new Date(flashcard.created_at).toLocaleDateString('pl-PL')}
          </span>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => onEdit(flashcard)}
              data-testid="edit-flashcard-button"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onDelete(flashcard)}
              data-testid="delete-flashcard-button"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }
); 