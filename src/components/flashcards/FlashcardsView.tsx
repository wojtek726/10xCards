import { useState } from "react";
import { FlashcardCard } from "./FlashcardCard";
import { FlashcardEditModal } from "./FlashcardEditModal";
import type { FlashcardDTO } from "@/types";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface FlashcardsViewProps {
  flashcards: FlashcardDTO[];
}

export function FlashcardsView({ flashcards: initialFlashcards }: FlashcardsViewProps) {
  const [flashcards, setFlashcards] = useState(initialFlashcards);
  const [editingFlashcard, setEditingFlashcard] = useState<FlashcardDTO | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeletingFlashcard, setIsDeletingFlashcard] = useState<FlashcardDTO | null>(null);

  const handleEdit = (flashcard: FlashcardDTO) => {
    setEditingFlashcard(flashcard);
    setIsEditModalOpen(true);
  };

  const handleDelete = (flashcard: FlashcardDTO) => {
    setIsDeletingFlashcard(flashcard);
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
        throw new Error('Failed to update flashcard');
      }

      const updated = await response.json();
      setFlashcards(cards => 
        cards.map(card => 
          card.id === editingFlashcard.id ? { ...card, ...updated } : card
        )
      );
    } catch (error) {
      console.error('Error updating flashcard:', error);
      // TODO: Add error toast notification
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
    } catch (error) {
      console.error('Error deleting flashcard:', error);
      // TODO: Add error toast notification
    } finally {
      setIsDeletingFlashcard(null);
    }
  };

  if (flashcards.length === 0) {
    return (
      <div className="text-center text-muted-foreground">
        <p>Nie masz jeszcze żadnych fiszek.</p>
        <p className="mt-2">Kliknij "Generuj nowe fiszki" aby stworzyć swoją pierwszą kolekcję!</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4" data-testid="flashcards-list">
        {flashcards.map((flashcard) => (
          <FlashcardCard
            key={flashcard.id}
            flashcard={flashcard}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <FlashcardEditModal
        flashcard={editingFlashcard}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingFlashcard(null);
        }}
        onSave={handleSave}
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
    </>
  );
} 