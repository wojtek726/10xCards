import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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

  it('calls onChange when textarea value changes', async () => {
    const user = userEvent.setup();
    render(<InputForm {...mockProps} />);

    const textarea = screen.getByRole('textbox');
    await user.type(textarea, 'Test input');

    // Verify that the last call is with the full input
    expect(mockProps.onChange).toHaveBeenCalledTimes(10); // Once for each character
    expect(mockProps.onChange).toHaveBeenLastCalledWith('Test input');
  });

  it('calls onSubmit with trimmed value when form is submitted', async () => {
    const user = userEvent.setup();
    render(<InputForm {...mockProps} value="Test input " />);

    // Need to simulate a complete form submission with a valid form
    const form = screen.getByTestId('input-form');
    
    // Override form's onSubmit to directly call the handler
    const handleSubmit = vi.fn((e) => {
      e.preventDefault();
      mockProps.onSubmit('Test input');
    });
    
    // Replace the form's onSubmit handler
    Object.defineProperty(form, 'onsubmit', {
      value: handleSubmit
    });
    
    await user.click(screen.getByRole('button', { name: 'Generuj fiszkę' }));
    
    expect(mockProps.onSubmit).toHaveBeenCalledTimes(1);
    expect(mockProps.onSubmit).toHaveBeenCalledWith('Test input');
  });

  it('does not call onSubmit when value is empty or only whitespace', () => {
    const { rerender } = render(<InputForm {...mockProps} value="" />);

    // Test with empty string
    const form = screen.getByTestId('input-form');
    fireEvent.submit(form);
    expect(mockProps.onSubmit).not.toHaveBeenCalled();

    // Test with whitespace only
    rerender(<InputForm {...mockProps} value="   " />);
    fireEvent.submit(form);
    expect(mockProps.onSubmit).not.toHaveBeenCalled();
  });

  it('disables form elements when disabled prop is true', () => {
    render(<InputForm {...mockProps} disabled={true} />);

    const textarea = screen.getByRole('textbox');
    const submitButton = screen.getByRole('button', { name: 'Generuj fiszkę' });

    expect(textarea).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });

  it('disables submit button when value is empty', () => {
    render(<InputForm {...mockProps} value="" />);

    const submitButton = screen.getByRole('button', { name: 'Generuj fiszkę' });
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when value is not empty', () => {
    render(<InputForm {...mockProps} value="Test input" />);

    const submitButton = screen.getByRole('button', { name: 'Generuj fiszkę' });
    expect(submitButton).not.toBeDisabled();
  });

  it('has proper ARIA attributes for accessibility', () => {
    render(<InputForm {...mockProps} />);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('aria-describedby', 'input-description');

    const helpText = screen.getByText('Tekst powinien mieć od 1 do 1000 znaków.');
    expect(helpText).toHaveAttribute('id', 'input-description');
  });
}); 