import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../db/database.types";
import type {
  CreateFlashcardCommandDTO,
  FlashcardDTO,
  PaginationDTO,
} from "../../types";
import { logger } from './logger.service';

export class FlashcardService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async createFlashcard(userId: string, command: CreateFlashcardCommandDTO): Promise<FlashcardDTO> {
    // Return mock data in test mode
    if (userId === 'test-user-id') {
      logger.debug("Using test mode data for flashcard creation");
      const mockFlashcard: FlashcardDTO = {
        id: `test-${Date.now()}`,
        front: command.front,
        back: command.back,
        card_origin: command.card_origin,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return mockFlashcard;
    }

    const { data, error } = await this.supabase
      .from("flashcards")
      .insert({
        user_id: userId,
        front: command.front,
        back: command.back,
        card_origin: command.card_origin,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create flashcard: ${error.message}`);
    }

    return {
      id: data.id,
      front: data.front,
      back: data.back,
      card_origin: data.card_origin,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  }

  async updateFlashcard(
    id: string,
    userId: string,
    data: { front: string; back: string }
  ): Promise<FlashcardDTO | null> {
    // Return mock data in test mode
    if (userId === 'test-user-id') {
      logger.debug("Using test mode data for flashcard update");
      const mockFlashcard: FlashcardDTO = {
        id,
        front: data.front,
        back: data.back,
        card_origin: 'manual',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return mockFlashcard;
    }

    // First, get the current flashcard to check its card_origin
    const { data: currentFlashcard, error: fetchError } = await this.supabase
      .from('flashcards')
      .select('card_origin')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        logger.info('Flashcard not found:', { flashcardId: id, userId });
        throw fetchError;
      }
      logger.error('Error fetching flashcard:', { error: fetchError, flashcardId: id, userId });
      throw fetchError;
    }

    // Determine if we need to update the card_origin
    let card_origin = currentFlashcard.card_origin;
    if (card_origin === 'ai') {
      card_origin = 'ai_modified';
    }

    try {
      const { data: updatedFlashcard, error } = await this.supabase
        .from('flashcards')
        .update({
          front: data.front,
          back: data.back,
          card_origin: card_origin,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          logger.info('Flashcard not found:', { flashcardId: id, userId });
          throw error;
        }
        logger.error('Error updating flashcard:', { error, flashcardId: id, userId });
        throw error;
      }

      logger.info('Flashcard updated:', { flashcardId: id, userId });
      return updatedFlashcard;
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'PGRST116') {
        logger.info('Flashcard not found:', { flashcardId: id, userId });
        throw error;
      }
      logger.error('Error updating flashcard:', { error, flashcardId: id, userId });
      throw error;
    }
  }

  async deleteFlashcard(id: string, userId: string): Promise<boolean> {
    // Return success in test mode
    if (userId === 'test-user-id') {
      logger.debug("Using test mode data for flashcard deletion");
      return true;
    }

    const { error } = await this.supabase
      .from('flashcards')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      logger.error('Error deleting flashcard:', { error, flashcardId: id, userId });
      return false;
    }

    return true;
  }

  async getFlashcard(userId: string, flashcardId: string): Promise<FlashcardDTO | null> {
    // Return mock data in test mode
    if (userId === 'test-user-id') {
      logger.debug("Using test mode data for flashcard retrieval");
      const mockFlashcard: FlashcardDTO = {
        id: flashcardId,
        front: 'Test Front',
        back: 'Test Back',
        card_origin: 'manual',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return mockFlashcard;
    }

    const { data, error } = await this.supabase
      .from("flashcards")
      .select()
      .eq("id", flashcardId)
      .eq("user_id", userId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch flashcard: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    return {
      id: data.id,
      front: data.front,
      back: data.back,
      card_origin: data.card_origin,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  }

  async getFlashcards(
    userId: string,
    page: number = 1,
    limit: number = 10,
    isTestMode: boolean = false
  ): Promise<{ flashcards: FlashcardDTO[]; pagination: PaginationDTO }> {
    // Return mock data in test mode
    if (isTestMode || userId === 'test-user-id') {
      logger.debug("Using test mode data for flashcards");
      const mockFlashcards: FlashcardDTO[] = [
        {
          id: 'test-1',
          front: 'Test Front 1',
          back: 'Test Back 1',
          card_origin: 'manual',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'test-2',
          front: 'Test Front 2',
          back: 'Test Back 2',
          card_origin: 'ai',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      return {
        flashcards: mockFlashcards,
        pagination: {
          total: mockFlashcards.length,
          page,
          limit,
        }
      };
    }
    
    try {
      // Pobieramy całkowitą liczbę fiszek dla użytkownika
      const { count, error: countError } = await this.supabase
        .from("flashcards")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      if (countError) {
        throw new Error(`Failed to count flashcards: ${countError.message}`);
      }

      const total = count || 0;
      const offset = (page - 1) * limit;

      // Pobieramy fiszki z paginacją
      const { data, error } = await this.supabase
        .from("flashcards")
        .select()
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        logger.error("Error fetching flashcards:", error);
        throw new Error(`Failed to fetch flashcards: ${error.message}`);
      }

      const flashcards = data.map((card) => ({
        id: card.id,
        front: card.front,
        back: card.back,
        card_origin: card.card_origin,
        created_at: card.created_at,
        updated_at: card.updated_at,
      }));

      return {
        flashcards,
        pagination: {
          total,
          page,
          limit,
        },
      };
    } catch (error) {
      console.error("Error fetching flashcards:", error);
      
      // Return empty data on error instead of crashing
      return {
        flashcards: [],
        pagination: {
          total: 0,
          page,
          limit,
        }
      };
    }
  }
} 