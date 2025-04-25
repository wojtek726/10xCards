import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FlashcardEditModal } from '../FlashcardEditModal';
import type { FlashcardDTO } from '@/types';

describe('FlashcardEditModal', () => {
  const mockFlashcard: FlashcardDTO = {
    id: '1',
    front: 'Test Front',
    back: 'Test Back',
    card_origin: 'ai',
    created_at: '2024-03-24T12:00:00Z',
    updated_at: '2024-03-24T12:00:00Z',
  };

  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal with flashcard content when open', () => {
    render(
      <FlashcardEditModal
        flashcard={mockFlashcard}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByText('Edytuj fiszkę')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Front')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Back')).toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', () => {
    render(
      <FlashcardEditModal
        flashcard={mockFlashcard}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    const cancelButton = screen.getByText('Anuluj');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('validates form fields before submission', async () => {
    render(
      <FlashcardEditModal
        flashcard={mockFlashcard}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    const frontInput = screen.getByTestId('flashcard-front-input');
    const backInput = screen.getByTestId('flashcard-back-input');
    const saveButton = screen.getByTestId('save-flashcard-button');

    // Clear inputs
    await userEvent.clear(frontInput);
    await userEvent.clear(backInput);
    
    // Try to submit empty form
    fireEvent.click(saveButton);

    expect(screen.getByText('Przód fiszki jest wymagany')).toBeInTheDocument();
    expect(screen.getByText('Tył fiszki jest wymagany')).toBeInTheDocument();
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('calls onSave with updated values when form is valid', async () => {
    render(
      <FlashcardEditModal
        flashcard={mockFlashcard}
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    const frontInput = screen.getByTestId('flashcard-front-input');
    const backInput = screen.getByTestId('flashcard-back-input');
    const saveButton = screen.getByTestId('save-flashcard-button');

    // Update inputs
    await userEvent.clear(frontInput);
    await userEvent.type(frontInput, 'New Front');
    await userEvent.clear(backInput);
    await userEvent.type(backInput, 'New Back');

    // Submit form
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        front: 'New Front',
        back: 'New Back',
      });
    });
  });
}); 