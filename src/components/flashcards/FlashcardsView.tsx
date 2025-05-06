import { useState } from "react";
import { FlashcardCard } from "./FlashcardCard";
import { FlashcardEditModal } from "./FlashcardEditModal";
import { FlashcardCreateModal } from "./FlashcardCreateModal";
import type { FlashcardDTO } from "@/types";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { AnimatePresence, motion } from "framer-motion";

interface FlashcardsViewProps {
  flashcards: FlashcardDTO[];
}

export function FlashcardsView({ flashcards: initialFlashcards }: FlashcardsViewProps) {
  const [flashcards, setFlashcards] = useState(initialFlashcards);
  const [editingFlashcard, setEditingFlashcard] = useState<FlashcardDTO | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeletingFlashcard, setIsDeletingFlashcard] = useState<FlashcardDTO | null>(null);
  const { toast } = useToast();

  const handleEdit = (flashcard: FlashcardDTO) => {
    setEditingFlashcard(flashcard);
    setIsEditModalOpen(true);
  };

  const handleDelete = (flashcard: FlashcardDTO) => {
    setIsDeletingFlashcard(flashcard);
  };

  const handleCreate = async (newFlashcard: { front: string; back: string }) => {
    try {
      const response = await fetch('/api/flashcards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newFlashcard),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create flashcard');
      }

      const created = await response.json();
      setFlashcards(cards => [created, ...cards]);
      toast({
        title: "Sukces!",
        description: "Fiszka została utworzona.",
        variant: "default",
      });
    } catch (error) {
      console.error('Error creating flashcard:', error);
      toast({
        title: "Błąd!",
        description: error instanceof Error ? error.message : "Nie udało się utworzyć fiszki",
        variant: "destructive",
      });
    }
  };

  const handleSave = async (updatedFlashcard: { front: string; back: string }) => {
    if (!editingFlashcard) return;

    try {
      const response = await fetch(`/api/flashcards/${editingFlashcard.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedFlashcard),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update flashcard');
      }

      const updated = await response.json();
      setFlashcards(cards => 
        cards.map(card => 
          card.id === editingFlashcard.id ? updated : card
        )
      );
      toast({
        title: "Sukces!",
        description: "Fiszka została zaktualizowana.",
        variant: "default",
      });
    } catch (error) {
      console.error('Error updating flashcard:', error);
      toast({
        title: "Błąd!",
        description: error instanceof Error ? error.message : "Nie udało się zaktualizować fiszki",
        variant: "destructive",
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!isDeletingFlashcard) return;

    try {
      const response = await fetch(`/api/flashcards/${isDeletingFlashcard.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete flashcard');
      }

      setFlashcards(cards => cards.filter(card => card.id !== isDeletingFlashcard.id));
      toast({
        title: "Sukces!",
        description: "Fiszka została usunięta.",
        variant: "default",
      });
    } catch (error) {
      console.error('Error deleting flashcard:', error);
      toast({
        title: "Błąd!",
        description: error instanceof Error ? error.message : "Nie udało się usunąć fiszki",
        variant: "destructive",
      });
    } finally {
      setIsDeletingFlashcard(null);
    }
  };

  return (
    <>
      <div className="mb-6 flex justify-end">
        <Button onClick={() => setIsCreateModalOpen(true)} data-testid="create-flashcard-button">
          <Plus className="h-4 w-4 mr-2" />
          Dodaj nową fiszkę
        </Button>
      </div>

      {flashcards.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-muted-foreground"
        >
          <p>Nie masz jeszcze żadnych fiszek.</p>
          <p className="mt-2">Kliknij "Dodaj nową fiszkę" aby stworzyć swoją pierwszą fiszkę!</p>
        </motion.div>
      ) : (
        <motion.div
          layout
          className="grid gap-4"
          data-testid="flashcards-list"
        >
          <AnimatePresence mode="popLayout">
            {flashcards.map((flashcard) => (
              <FlashcardCard
                key={flashcard.id}
                flashcard={flashcard}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <FlashcardEditModal
        flashcard={editingFlashcard}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingFlashcard(null);
        }}
        onSave={handleSave}
      />

      <FlashcardCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreate}
      />

      <AlertDialog open={!!isDeletingFlashcard} onOpenChange={() => setIsDeletingFlashcard(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Czy na pewno chcesz usunąć tę fiszkę?</AlertDialogTitle>
            <AlertDialogDescription>
              Ta akcja jest nieodwracalna. Fiszka zostanie trwale usunięta z systemu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Usuń
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster />
    </>
  );
} 