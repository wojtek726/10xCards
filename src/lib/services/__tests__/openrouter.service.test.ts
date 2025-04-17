import { describe, expect, it, beforeEach } from "@jest/globals";
import { config } from "dotenv";
import { OpenRouterService } from "../openrouter.service";
import type { ChatInput } from "../../../types";

// Załaduj zmienne środowiskowe z .env
config();

// Deklaracja typów dla import.meta.env w środowisku testowym
declare global {
  var import: {
    meta: {
      env: {
        OPENROUTER_API_KEY: string | undefined;
      };
    };
  };
}

// Mock import.meta.env
global.import = {
  meta: {
    env: {
      OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    },
  },
};

describe("OpenRouterService", () => {
  let service: OpenRouterService;

  beforeEach(() => {
    // Upewnij się, że mamy ustawioną zmienną środowiskową OPENROUTER_API_KEY
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY environment variable is required for tests");
    }
    service = new OpenRouterService(process.env.OPENROUTER_API_KEY);
  });

  it("should generate a flashcard suggestion", async () => {
    const input: ChatInput = {
      systemMessage:
        'You are a helpful AI assistant that creates flashcards. Always provide concise and clear content. Response must be a valid JSON object with "front" and "back" fields.',
      userMessage: "Create a flashcard about TypeScript interfaces.",
      responseFormat: {
        type: "json_object",
      },
    };

    const response = await service.sendChatCompletion(input);
    console.log("API Response:", response);

    // Podstawowe sprawdzenia odpowiedzi
    expect(response).toBeDefined();
    expect(response.response).toBeDefined();
    expect(response.model).toBeDefined();
    expect(response.usage).toBeDefined();
    expect(response.usage.total_tokens).toBeGreaterThan(0);

    // Sprawdź, czy odpowiedź jest poprawnym JSON zgodnym ze schematem
    let parsedResponse: { front: string; back: string } | undefined;
    expect(() => {
      const parsed = JSON.parse(response.response);
      if (typeof parsed !== "object" || parsed === null) {
        throw new Error("Response is not an object");
      }
      if (!("front" in parsed) || !("back" in parsed)) {
        throw new Error("Response missing required fields");
      }
      if (typeof parsed.front !== "string" || typeof parsed.back !== "string") {
        throw new Error("Response fields have incorrect types");
      }
      parsedResponse = parsed;
    }).not.toThrow();

    // Po walidacji wiemy, że parsedResponse jest zdefiniowane
    expect(parsedResponse).toBeDefined();
    const validatedResponse = parsedResponse as { front: string; back: string };
    expect(validatedResponse.front.length).toBeGreaterThan(0);
    expect(validatedResponse.back.length).toBeGreaterThan(0);
  }, 30000); // Zwiększamy timeout do 30 sekund
});
