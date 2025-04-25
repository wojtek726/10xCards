import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { FlashcardDeleteDialog } from "./FlashcardDeleteDialog";
import { vi } from "vitest";

describe("FlashcardDeleteDialog", () => {
  const mockOnClose = vi.fn();
  const mockOnConfirm = vi.fn();
  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onConfirm: mockOnConfirm,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders correctly when open", () => {
    render(<FlashcardDeleteDialog {...defaultProps} />);
    
    expect(screen.getByText("Delete Flashcard")).toBeInTheDocument();
    expect(screen.getByText(/Are you sure/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(<FlashcardDeleteDialog {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText("Delete Flashcard")).not.toBeInTheDocument();
  });

  it("calls onClose when Cancel button is clicked", () => {
    render(<FlashcardDeleteDialog {...defaultProps} />);
    
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("handles deletion process correctly", async () => {
    mockOnConfirm.mockResolvedValueOnce(undefined);
    render(<FlashcardDeleteDialog {...defaultProps} />);
    
    const deleteButton = screen.getByRole("button", { name: "Delete" });
    fireEvent.click(deleteButton);

    // Verify loading state
    expect(screen.getByRole("button", { name: "Deleting..." })).toBeInTheDocument();
    expect(deleteButton).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();

    await waitFor(() => {
      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it("handles deletion error gracefully", async () => {
    const error = new Error("Failed to delete");
    mockOnConfirm.mockRejectedValueOnce(error);
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(<FlashcardDeleteDialog {...defaultProps} />);
    
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("Error deleting flashcard:", error);
      expect(screen.getByRole("button", { name: "Delete" })).toBeEnabled();
      expect(screen.getByRole("button", { name: "Cancel" })).toBeEnabled();
    });

    consoleSpy.mockRestore();
  });

  it("calls onClose when dialog is dismissed", () => {
    render(<FlashcardDeleteDialog {...defaultProps} />);
    
    // Simulate clicking outside the dialog or pressing ESC
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
}); 