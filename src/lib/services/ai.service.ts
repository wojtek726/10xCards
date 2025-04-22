import type { GenerateFlashcardResponseDTO } from "../../types";
import { OpenRouterService } from "./openrouter.service";

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
          "You are a helpful AI assistant that creates flashcards. Create a concise and clear flashcard based on the provided text. The response must be a valid JSON object with 'front' (question or concept) and 'back' (answer or explanation) fields. Keep the front short and focused, and the back clear and informative. IMPORTANT: Make sure to escape any special characters in the JSON response and use '\\n' for line breaks. DO NOT use actual line breaks in the JSON. The response must be a single line of valid JSON.",
        userMessage: input_text,
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
      
      console.log("Cleaned JSON string:", jsonStr);
      
      // Try to parse the JSON
      let flashcard;
      try {
        flashcard = JSON.parse(jsonStr);
      } catch (error) {
        console.error("Failed to parse JSON response:", jsonStr);
        throw new Error(`Invalid JSON response from AI: ${error instanceof Error ? error.message : 'Unknown parsing error'}`);
      }

      // Validate the response structure
      if (!flashcard.front || !flashcard.back) {
        throw new Error("AI response missing required fields (front/back)");
      }

      // Convert escaped newlines back to actual newlines for display
      flashcard.front = flashcard.front.replace(/\\n/g, "\n");
      flashcard.back = flashcard.back.replace(/\\n/g, "\n");

      // Return in the expected format
      return {
        suggested_flashcard: {
          front: flashcard.front,
          back: flashcard.back,
          suggested_card_origin: "ai",
        },
      };
    } catch (error) {
      console.error("Error generating flashcard:", error);
      throw error;
    }
  }
}
