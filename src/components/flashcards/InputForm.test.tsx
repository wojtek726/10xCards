import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InputForm } from './InputForm';

describe('InputForm', () => {
  const mockProps = {
    value: '',
    onChange: vi.fn(),
    onSubmit: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form with all required elements', () => {
    render(<InputForm {...mockProps} />);

    // Check if label is rendered
    expect(screen.getByText('Tekst do przetworzenia')).toBeInTheDocument();

    // Check if textarea is rendered with correct attributes
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveAttribute('placeholder', 'Wklej tutaj tekst, z którego chcesz wygenerować fiszkę...');
    expect(textarea).toHaveAttribute('required');
    expect(textarea).toHaveAttribute('minLength', '1');
    expect(textarea).toHaveAttribute('maxLength', '1000');

    // Check if help text is rendered
    expect(screen.getByText('Tekst powinien mieć od 1 do 1000 znaków.')).toBeInTheDocument();

    // Check if submit button is rendered
    expect(screen.getByRole('button', { name: 'Generuj fiszkę' })).toBeInTheDocument();
  });

  it('renders with default value', async () => {
    await act(async () => {
      render(<InputForm value="Default text" onChange={() => {}} onSubmit={() => {}} />);
    });
    
    expect(screen.getByRole('textbox')).toHaveValue('Default text');
  });

  it('renders disabled state correctly', async () => {
    await act(async () => {
      render(<InputForm value="" onChange={() => {}} onSubmit={() => {}} disabled={true} />);
    });
    
    expect(screen.getByRole('textbox')).toBeDisabled();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('calls onChange when textarea value changes', async () => {
    const handleChange = vi.fn();
    
    await act(async () => {
      render(<InputForm value="" onChange={handleChange} onSubmit={() => {}} />);
    });
    
    const textarea = screen.getByRole('textbox');
    
    await act(async () => {
      await userEvent.type(textarea, 'New text');
    });
    
    expect(handleChange).toHaveBeenCalledWith('New text');
  });

  it('disables submit button when value is empty', async () => {
    await act(async () => {
      render(<InputForm value="" onChange={() => {}} onSubmit={() => {}} />);
    });
    
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('disables submit button when value contains only spaces', async () => {
    await act(async () => {
      render(<InputForm value="   " onChange={() => {}} onSubmit={() => {}} />);
    });
    
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('enables submit button when value is not empty', async () => {
    await act(async () => {
      render(<InputForm value="Test" onChange={() => {}} onSubmit={() => {}} />);
    });
    
    expect(screen.getByRole('button')).toBeEnabled();
  });

  it('calls onSubmit with trimmed value when form is submitted', async () => {
    const handleSubmit = vi.fn();
    
    await act(async () => {
      render(<InputForm value="  Test  " onChange={() => {}} onSubmit={handleSubmit} />);
    });
    
    const form = screen.getByTestId('flashcard-generation-form');
    
    await act(async () => {
      fireEvent.submit(form);
    });
    
    expect(handleSubmit).toHaveBeenCalledWith('Test');
  });

  it('updates when value prop changes', async () => {
    let value = 'Initial';
    const handleChange = vi.fn((newValue: string) => {
      value = newValue;
    });
    
    const { rerender } = render(
      <InputForm value={value} onChange={handleChange} onSubmit={() => {}} />
    );
    
    expect(screen.getByRole('textbox')).toHaveValue('Initial');
    
    await act(async () => {
      rerender(<InputForm value="Updated" onChange={handleChange} onSubmit={() => {}} />);
    });
    
    expect(screen.getByRole('textbox')).toHaveValue('Updated');
  });

  it('has proper ARIA attributes for accessibility', () => {
    render(<InputForm {...mockProps} />);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('aria-describedby', 'input-description');

    const helpText = screen.getByText('Tekst powinien mieć od 1 do 1000 znaków.');
    expect(helpText).toHaveAttribute('id', 'input-description');
  });
}); 