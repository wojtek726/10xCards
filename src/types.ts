/*
  DTO and Command Model definitions for the application
  Based on the database models (src/db/database.types.ts) and the API plan (api-plan.md).
*/

import type { Database } from "./db/database.types";

// CardOrigin type directly coming from the database enum for flashcards
export type CardOrigin = Database["public"]["Enums"]["card_origin_enum"];

// -------------------------
// Authentication DTOs
// -------------------------

// Request DTO for user registration.
export interface RegisterRequestDTO {
  login: string;
  password: string;
}

// Response DTO for user registration.
// Maps to the users table while omitting the hash_password field.
export interface RegisterResponseDTO {
  user: {
    id: string;
    login: string;
    created_at: string;
  };
  token: string;
}

// Request DTO for user login.
export interface LoginRequestDTO {
  login: string;
  password: string;
}

// Response DTO for user login.
// Only includes essential user information.
export interface LoginResponseDTO {
  user: {
    id: string;
    login: string;
  };
  token: string;
}

// Request DTO for changing password.
export interface ChangePasswordRequestDTO {
  current_password: string;
  new_password: string;
}

// Response DTO for changing password.
export interface ChangePasswordResponseDTO {
  success: true;
}

// -------------------------
// Account Management DTOs
// -------------------------

// Response DTO for account deletion.
export interface DeleteAccountResponseDTO {
  success: true;
}

// -------------------------
// Flashcard DTOs and Command Models
// -------------------------

// Base Flashcard DTO representing flashcard details from the database.
// Note: We omit the user_id field since it is managed via session context.
export interface FlashcardDTO {
  id: string;
  front: string;
  back: string;
  card_origin: CardOrigin;
  created_at: string;
  updated_at?: string;
}

// Brief Flashcard DTO for list responses (excludes updated_at).
export type FlashcardBriefDTO = Omit<FlashcardDTO, "updated_at">;

// DTO for flashcard detail response (identical to FlashcardBriefDTO).
export type FlashcardDetailDTO = FlashcardBriefDTO;

// Pagination DTO for flashcards list responses.
export interface PaginationDTO {
  total: number;
  page: number;
  limit: number;
}

// Response DTO for retrieving a list of flashcards.
export interface GetFlashcardsResponseDTO {
  flashcards: FlashcardBriefDTO[];
  pagination: PaginationDTO;
}

// Command DTO for creating a flashcard.
// The request body should include front, back, and card_origin (which may be 'manual', 'ai', or 'ai_modified').
export interface CreateFlashcardCommandDTO {
  front: string;
  back: string;
  card_origin: CardOrigin;
}

// Response DTO for creating a flashcard.
// Returns full flashcard details including generated id and timestamps.
export type CreateFlashcardResponseDTO = FlashcardDTO;

// Command DTO for updating an existing flashcard.
// Supports partial updates of the flashcard content.
export interface UpdateFlashcardCommandDTO {
  front?: string;
  back?: string;
}

// Response DTO for updating a flashcard.
// Returns updated flashcard details including updated_at timestamp.
export interface UpdateFlashcardResponseDTO {
  id: string;
  front: string;
  back: string;
  card_origin: CardOrigin;
  updated_at: string;
}

// -------------------------
// AI Flashcard Generation DTOs
// -------------------------

// Request DTO for generating a flashcard via AI.
export interface GenerateFlashcardRequestDTO {
  input_text: string;
}

// Response DTO for AI-generated flashcard suggestion.
// The generated flashcard suggestion always has a suggested_card_origin of 'ai'.
export interface GenerateFlashcardResponseDTO {
  suggested_flashcard: {
    front: string;
    back: string;
    suggested_card_origin: "ai";
  };
}

// -------------------------
// Generic DTOs
// -------------------------

// A generic success response used across various endpoints.
export interface GenericSuccessResponseDTO {
  success: true;
}

export interface ModelParameters {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

export interface ChatInput {
  systemMessage: string;
  userMessage: string;
  responseFormat?: ResponseFormat;
}

export interface ResponseFormat {
  type: "json_object";
}

export interface ChatResponse {
  response: string;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface RequestPayload {
  messages: {
    role: "system" | "user";
    content: string;
  }[];
  model: string;
  response_format?: ResponseFormat;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

export enum OpenRouterErrorCode {
  NETWORK_ERROR = "NETWORK_ERROR",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  AUTH_ERROR = "AUTH_ERROR",
  RATE_LIMIT_ERROR = "RATE_LIMIT_ERROR",
  SERVER_ERROR = "SERVER_ERROR",
  TIMEOUT_ERROR = "TIMEOUT_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

export class OpenRouterError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly code?: OpenRouterErrorCode | string,
    public readonly retryable = false
  ) {
    super(message);
    this.name = "OpenRouterError";
  }

  static isRetryableError(error: Error): boolean {
    if (error instanceof OpenRouterError) {
      if (error.retryable) return true;
      if (error.statusCode) {
        // Retry on 429 (rate limit), 503 (service unavailable), and 504 (gateway timeout)
        return [429, 503, 504].includes(error.statusCode);
      }
    }
    // Network errors are generally retryable
    return error.message.toLowerCase().includes("network") || error.message.toLowerCase().includes("timeout");
  }
}
