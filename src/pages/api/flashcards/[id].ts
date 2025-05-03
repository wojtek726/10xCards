import type { APIRoute } from 'astro';
import type { AstroCookies } from 'astro';
import { createServerClient } from '../../../db/supabase.client';
import { FlashcardService } from '../../../lib/services/flashcard.service';
import { z } from 'zod';
import { logger } from '../../../lib/utils/logger';

export const prerender = false;

const updateFlashcardSchema = z.object({
  front: z.string().min(1),
  back: z.string().min(1),
});

interface APIContext {
  request: Request;
  cookies: AstroCookies;
  params: { id?: string };
}

export async function PUT({ request, cookies, params }: APIContext) {
  try {
    const supabase = createServerClient(cookies);
    const flashcardService = new FlashcardService(supabase);

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      logger.warn('Unauthorized access attempt:', { error: authError });
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const flashcardId = params.id;
    if (!flashcardId) {
      logger.warn('Missing flashcard ID in request');
      return new Response(JSON.stringify({ error: 'Missing flashcard ID' }), { status: 400 });
    }

    const body = await request.json();
    const validationResult = updateFlashcardSchema.safeParse(body);

    if (!validationResult.success) {
      logger.warn('Invalid request body:', { errors: validationResult.error });
      return new Response(JSON.stringify({ error: 'Invalid request body', details: validationResult.error }), { status: 400 });
    }

    try {
      const updatedFlashcard = await flashcardService.updateFlashcard(flashcardId, user.id, validationResult.data);
      
      // Check if flashcard was found and updated
      if (!updatedFlashcard) {
        logger.error('Flashcard not found or access denied:', { flashcardId, userId: user.id });
        return new Response(JSON.stringify({ error: 'Flashcard not found or access denied' }), { status: 404 });
      }
      
      logger.info('Flashcard updated successfully:', { flashcardId });
      return new Response(JSON.stringify(updatedFlashcard), { status: 200 });
    } catch (error: unknown) {
      // Handle 'not found' errors specifically
      if (error && typeof error === 'object') {
        const err = error as { name?: string; message?: string };
        if ((err.name === 'FLASHCARD_NOT_FOUND') || 
            (err.message && err.message.includes('not found'))) {
          logger.error('Flashcard not found or access denied:', { error: err.message });
          return new Response(JSON.stringify({ error: 'Flashcard not found or access denied' }), { status: 404 });
        }
      }
      throw error; // re-throw to be caught by outer catch
    }
  } catch (error) {
    logger.error('Error updating flashcard:', { error });
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}

export const DELETE: APIRoute = async ({ params, cookies }) => {
  try {
    const supabase = createServerClient(cookies);
    const flashcardService = new FlashcardService(supabase);
    
    // Get user from auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      logger.warn('Unauthorized access attempt:', { error: authError });
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // Validate flashcard ID
    const { id } = params;
    if (!id) {
      logger.warn('Missing flashcard ID in request');
      return new Response(JSON.stringify({ error: 'Missing flashcard ID' }), { status: 400 });
    }

    try {
      // Delete flashcard
      const success = await flashcardService.deleteFlashcard(id, user.id);
      if (!success) {
        logger.warn('Flashcard not found or access denied:', { flashcardId: id, userId: user.id });
        return new Response(JSON.stringify({ error: 'Flashcard not found' }), { status: 404 });
      }

      logger.info('Flashcard deleted successfully:', { flashcardId: id });
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'PGRST116') {
        logger.warn('Flashcard not found:', { flashcardId: id, userId: user.id });
        return new Response(JSON.stringify({ error: 'Flashcard not found' }), { status: 404 });
      }
      throw error;
    }

  } catch (error) {
    logger.error('Error deleting flashcard:', { error });
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}; 