import type { GenerateFlashcardResponseDTO } from "../../types";
import { OpenRouterService } from "./openrouter.service";
import { logger } from './logger.service';

export class AIService {
  private readonly openRouterService: OpenRouterService;

  constructor() {
    this.openRouterService = new OpenRouterService();
  }

  /**
   * Generates a flashcard suggestion using AI based on the provided input text.
   *
   * @param input_text - The text to generate a flashcard from
   * @returns A promise that resolves to the generated flashcard suggestion
   * @throws Error if the operation fails
   */
  async generateFlashcard(input_text: string): Promise<GenerateFlashcardResponseDTO> {
    try {
      const response = await this.openRouterService.sendChatCompletion({
        systemMessage:
          "You are a helpful AI assistant that creates flashcards. Create a concise and clear flashcard based on the provided text. The response must be a valid JSON object with 'front' (question or concept) and 'back' (answer or explanation) fields. IMPORTANT CONSTRAINTS: The front must be max 150 characters and the back must be max 450 characters. Keep the front as a clear, focused question, and the back as a concise but comprehensive answer. Use simple language and focus on the most important information. Break down complex concepts into simpler parts. IMPORTANT: Make sure to escape any special characters in the JSON response and use '\\n' for line breaks. DO NOT use actual line breaks in the JSON. The response must be a single line of valid JSON. DO NOT include any explanations or additional text outside the JSON object.",
        userMessage: `Create a concise flashcard from this text. Keep the answer clear but brief (max 450 characters): ${input_text}`,
        responseFormat: {
          type: "json_object",
        },
      });

      // Try to clean up and parse the JSON response
      let jsonStr = response.response.trim();
      
      // Remove any potential markdown code block markers
      jsonStr = jsonStr.replace(/^```json\n?/, "").replace(/\n?```$/, "");
      
      // Replace any actual newlines with spaces to ensure valid JSON
      jsonStr = jsonStr.replace(/\n/g, " ");
      
      logger.debug("Cleaned JSON string:", jsonStr);
      
      // Try to parse the JSON
      let flashcard;
      try {
        flashcard = JSON.parse(jsonStr);
        logger.debug("Parsed flashcard data:", flashcard);
      } catch (error) {
        logger.error("Failed to parse JSON response:", jsonStr);
        throw new Error(`Invalid JSON response from AI: ${error instanceof Error ? error.message : 'Unknown parsing error'}`);
      }

      // Validate the response structure and length
      if (!flashcard.front || !flashcard.back) {
        logger.error("Invalid flashcard structure:", flashcard);
        throw new Error("AI response missing required fields (front/back)");
      }

      // Truncate content if it exceeds limits
      if (flashcard.front.length > 150) {
        logger.warn("Front content too long, truncating...");
        flashcard.front = flashcard.front.slice(0, 147) + "...";
      }
      if (flashcard.back.length > 450) {
        logger.warn("Back content too long, truncating...");
        flashcard.back = flashcard.back.slice(0, 447) + "...";
      }

      // Convert escaped newlines back to actual newlines for display
      flashcard.front = flashcard.front.replace(/\\n/g, "\n");
      flashcard.back = flashcard.back.replace(/\\n/g, "\n");

      const result: GenerateFlashcardResponseDTO = {
        suggested_flashcard: {
          front: flashcard.front,
          back: flashcard.back,
          suggested_card_origin: "ai" as const,
        },
      };
      
      logger.debug("Final flashcard data:", result);
      return result;
    } catch (error) {
      logger.error("Error generating flashcard:", error);
      throw error;
    }
  }
}
