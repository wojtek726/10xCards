import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GenerowanieFiszkiView } from './GenerowanieFiszkiView';
import type { GenerateFlashcardResponseDTO } from '@/types';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('GenerowanieFiszkiView', () => {
  const mockSuggestion: GenerateFlashcardResponseDTO['suggested_flashcard'] = {
    front: 'Test front',
    back: 'Test back',
    suggested_card_origin: 'ai'
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders the input form initially', () => {
    render(<GenerowanieFiszkiView />);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Generuj fiszkę' })).toBeInTheDocument();
  });

  it('shows loading state when generating flashcard', async () => {
    mockFetch.mockImplementationOnce(() => new Promise(() => {})); // Never resolves to keep loading
    render(<GenerowanieFiszkiView />);

    const input = screen.getByRole('textbox');
    const submitButton = screen.getByRole('button', { name: 'Generuj fiszkę' });

    await userEvent.type(input, 'Test input');
    fireEvent.click(submitButton);

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(input).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });

  it('displays generated flashcard suggestion on successful API call', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ suggested_flashcard: mockSuggestion }),
      clone: () => ({
        ok: true,
        json: () => Promise.resolve({ suggested_flashcard: mockSuggestion })
      })
    });

    render(<GenerowanieFiszkiView />);

    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'Test input');
    fireEvent.click(screen.getByRole('button', { name: 'Generuj fiszkę' }));

    // Wait for the suggestion card to appear
    await waitFor(() => {
      expect(screen.getByText('Wygenerowana fiszka')).toBeInTheDocument();
    });

    expect(screen.getByText('Test front')).toBeInTheDocument();
    expect(screen.getByText('Test back')).toBeInTheDocument();
  });

  it('displays error message on API failure', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Test error'));

    render(<GenerowanieFiszkiView />);

    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'Test input');
    fireEvent.click(screen.getByRole('button', { name: 'Generuj fiszkę' }));

    expect(await screen.findByText('Test error')).toBeInTheDocument();
  });

  it('handles specific HTTP error status codes', async () => {
    // Test 400 error
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      clone: () => ({
        ok: false,
        status: 400
      })
    });

    render(<GenerowanieFiszkiView />);

    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'Test input');
    fireEvent.click(screen.getByRole('button', { name: 'Generuj fiszkę' }));

    expect(await screen.findByText(/Nieprawidłowe dane wejściowe/)).toBeInTheDocument();
  });

  it('saves flashcard when accept button is clicked', async () => {
    // Set up mock responses in sequence
    // First: successful response from generate endpoint
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ suggested_flashcard: mockSuggestion }),
      clone: () => ({
        ok: true,
        json: () => Promise.resolve({ suggested_flashcard: mockSuggestion })
      })
    });
    
    // Second: successful response from save endpoint
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
      clone: () => ({
        ok: true,
        json: () => Promise.resolve({})
      })
    });

    render(<GenerowanieFiszkiView />);

    // Generate flashcard
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'Test input');
    fireEvent.click(screen.getByRole('button', { name: 'Generuj fiszkę' }));

    // Wait for flashcard suggestion to appear
    await waitFor(() => {
      expect(screen.getByText('Test front')).toBeInTheDocument();
    });

    // Find and click the accept button
    const acceptButton = screen.getByRole('button', { name: 'Akceptuj' });
    fireEvent.click(acceptButton);

    // Verify the API was called correctly - just check it was called twice,
    // once for generate and once for save
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2);
      
      // Further verification would be more complex due to Request objects in modern fetch
      // Just check the suggestion is removed after saving
    });

    // Check that the suggestion was removed
    expect(screen.queryByText('Wygenerowana fiszka')).not.toBeInTheDocument();
  });

  it('removes suggestion when reject button is clicked', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ suggested_flashcard: mockSuggestion }),
      clone: () => ({
        ok: true,
        json: () => Promise.resolve({ suggested_flashcard: mockSuggestion })
      })
    });

    render(<GenerowanieFiszkiView />);

    // Generate flashcard
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'Test input');
    fireEvent.click(screen.getByRole('button', { name: 'Generuj fiszkę' }));

    // Wait for flashcard suggestion to appear
    await waitFor(() => {
      expect(screen.getByText('Test front')).toBeInTheDocument();
    });

    // Find and click the reject button
    const rejectButton = screen.getByRole('button', { name: 'Odrzuć' });
    fireEvent.click(rejectButton);

    // Verify suggestion is removed
    expect(screen.queryByText('Wygenerowana fiszka')).not.toBeInTheDocument();
    expect(input).toHaveValue('Test input'); // Input should retain its value
  });

  it('handles network errors when saving flashcard', async () => {
    // First: successful response from generate endpoint
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ suggested_flashcard: mockSuggestion }),
      clone: () => ({
        ok: true,
        json: () => Promise.resolve({ suggested_flashcard: mockSuggestion })
      })
    });
    
    // Second: network error when saving
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<GenerowanieFiszkiView />);

    // Generate flashcard
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'Test input');
    fireEvent.click(screen.getByRole('button', { name: 'Generuj fiszkę' }));

    // Wait for flashcard suggestion to appear
    await waitFor(() => {
      expect(screen.getByText('Test front')).toBeInTheDocument();
    });

    // Find and click the accept button
    const acceptButton = screen.getByRole('button', { name: 'Akceptuj' });
    fireEvent.click(acceptButton);

    // Verify error message
    expect(await screen.findByText('Network error')).toBeInTheDocument();
  });
}); 