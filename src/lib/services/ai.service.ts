import type { GenerateFlashcardResponseDTO } from "../../types";

// Default timeout for AI operations (3 seconds)
const AI_TIMEOUT_MS = 3000;

export class AIService {
  /**
   * Generates a flashcard suggestion using AI based on the provided input text.
   * Currently using a mock implementation for development.
   *
   * @param input_text - The text to generate a flashcard from
   * @returns A promise that resolves to the generated flashcard suggestion
   * @throws Error if the operation times out
   */
  static async generateFlashcard(input_text: string): Promise<GenerateFlashcardResponseDTO> {
    // Create a timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("AI operation timed out")), AI_TIMEOUT_MS);
    });

    // Create the AI operation promise
    const aiPromise = new Promise<GenerateFlashcardResponseDTO>((resolve) => {
      setTimeout(() => {
        resolve({
          suggested_flashcard: {
            front: `Question about: ${input_text.slice(0, 50)}...`,
            back: `AI generated answer for: ${input_text.slice(0, 50)}...`,
            suggested_card_origin: "ai",
          },
        });
      }, 500);
    });

    // Race between timeout and AI operation
    return Promise.race([aiPromise, timeoutPromise]);
  }
}
