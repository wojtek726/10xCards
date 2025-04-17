import type { GenerateFlashcardResponseDTO } from "../../types";
import { OpenRouterService } from "./openrouter.service";

export class AIService {
  private readonly openRouterService: OpenRouterService;

  constructor() {
    this.openRouterService = new OpenRouterService();
  }

  /**
   * Generates a flashcard suggestion using AI based on the provided input text.
   * Currently using a mock implementation for development.
   *
   * @param input_text - The text to generate a flashcard from
   * @returns A promise that resolves to the generated flashcard suggestion
   * @throws Error if the operation times out
   */
  async generateFlashcard(input_text: string): Promise<GenerateFlashcardResponseDTO> {
    const response = await this.openRouterService.sendChatCompletion({
      systemMessage:
        "You are a helpful AI assistant that creates flashcards. Create a concise and clear flashcard based on the provided text. The response must be a valid JSON object with 'front' (question or concept) and 'back' (answer or explanation) fields. Keep the front short and focused, and the back clear and informative.",
      userMessage: input_text,
      responseFormat: {
        type: "json_object",
      },
    });

    // Parse the JSON response
    const flashcard = JSON.parse(response.response);

    // Return in the expected format
    return {
      suggested_flashcard: {
        front: flashcard.front,
        back: flashcard.back,
        suggested_card_origin: "ai",
      },
    };
  }
}
