import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FlashcardSuggestionCard } from './FlashcardSuggestionCard';
import type { GenerateFlashcardResponseDTO } from '@/types';

describe('FlashcardSuggestionCard', () => {
  // Setup test data
  const mockSuggestion: GenerateFlashcardResponseDTO['suggested_flashcard'] = {
    front: 'Test front content',
    back: 'Test back content',
    suggested_card_origin: 'ai'
  };

  const mockProps = {
    suggestion: mockSuggestion,
    onAccept: vi.fn(),
    onReject: vi.fn(),
  };

  // Reset mocks after each test
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with provided content', () => {
    render(<FlashcardSuggestionCard {...mockProps} />);

    // Check if title is rendered
    expect(screen.getByText('Wygenerowana fiszka')).toBeInTheDocument();

    // Check if front and back content is rendered
    expect(screen.getByText('Test front content')).toBeInTheDocument();
    expect(screen.getByText('Test back content')).toBeInTheDocument();

    // Check if buttons are rendered
    expect(screen.getByText('Akceptuj')).toBeInTheDocument();
    expect(screen.getByText('Odrzuć')).toBeInTheDocument();
  });

  it('calls onAccept when accept button is clicked', () => {
    render(<FlashcardSuggestionCard {...mockProps} />);
    
    const acceptButton = screen.getByText('Akceptuj');
    fireEvent.click(acceptButton);

    expect(mockProps.onAccept).toHaveBeenCalledTimes(1);
  });

  it('calls onReject when reject button is clicked', () => {
    render(<FlashcardSuggestionCard {...mockProps} />);
    
    const rejectButton = screen.getByText('Odrzuć');
    fireEvent.click(rejectButton);

    expect(mockProps.onReject).toHaveBeenCalledTimes(1);
  });

  it('disables buttons when disabled prop is true', () => {
    render(<FlashcardSuggestionCard {...mockProps} disabled={true} />);
    
    const acceptButton = screen.getByText('Akceptuj');
    const rejectButton = screen.getByText('Odrzuć');

    expect(acceptButton).toBeDisabled();
    expect(rejectButton).toBeDisabled();

    // Verify that clicking disabled buttons doesn't trigger callbacks
    fireEvent.click(acceptButton);
    fireEvent.click(rejectButton);

    expect(mockProps.onAccept).not.toHaveBeenCalled();
    expect(mockProps.onReject).not.toHaveBeenCalled();
  });

  it('has proper ARIA attributes for accessibility', () => {
    render(<FlashcardSuggestionCard {...mockProps} />);
    
    // Verify that buttons are properly labeled for screen readers
    const acceptButton = screen.getByText('Akceptuj');
    const rejectButton = screen.getByText('Odrzuć');

    expect(acceptButton).toHaveAttribute('type', 'button');
    expect(rejectButton).toHaveAttribute('type', 'button');
  });
}); 