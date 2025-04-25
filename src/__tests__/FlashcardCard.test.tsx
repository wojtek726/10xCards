import { render, screen, fireEvent } from '@testing-library/react';
import { FlashcardCard } from '../FlashcardCard';
import type { FlashcardDTO } from '@/types';

describe('FlashcardCard', () => {
  const mockFlashcard: FlashcardDTO = {
    id: '1',
    front: 'Test Front',
    back: 'Test Back',
    card_origin: 'ai',
    created_at: '2024-03-24T12:00:00Z',
    updated_at: '2024-03-24T12:00:00Z',
  };

  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders flashcard content correctly', () => {
    render(
      <FlashcardCard
        flashcard={mockFlashcard}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Test Front')).toBeInTheDocument();
    expect(screen.getByText('Test Back')).toBeInTheDocument();
    expect(screen.getByText('AI')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    render(
      <FlashcardCard
        flashcard={mockFlashcard}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const editButton = screen.getByTestId('edit-flashcard-button');
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockFlashcard);
  });

  it('calls onDelete when delete button is clicked', () => {
    render(
      <FlashcardCard
        flashcard={mockFlashcard}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const deleteButton = screen.getByTestId('delete-flashcard-button');
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledWith(mockFlashcard);
  });

  it('displays correct badge variant for different card origins', () => {
    const origins = [
      { origin: 'ai', label: 'AI' },
      { origin: 'ai_modified', label: 'AI (zmodyfikowane)' },
      { origin: 'manual', label: 'Ręcznie' },
    ];

    origins.forEach(({ origin, label }) => {
      const flashcard = { ...mockFlashcard, card_origin: origin };
      const { rerender } = render(
        <FlashcardCard
          flashcard={flashcard as FlashcardDTO}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText(label)).toBeInTheDocument();
      rerender(<></>);
    });
  });
}); 