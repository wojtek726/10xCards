import type { APIRoute } from 'astro';
import type { AstroCookies } from 'astro';
import { createSupabaseServerInstance } from '../../../../db/supabase.client';
import { FlashcardService } from '../../../lib/services/flashcard.service';
import { z } from 'zod';
import { logger } from '../../../lib/utils/logger';
import { getUser } from '../../../lib/auth';
import { createServerClient } from '../../../lib/supabase/server';

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

    const updatedFlashcard = await flashcardService.updateFlashcard(flashcardId, user.id, validationResult.data);
    if (!updatedFlashcard) {
      logger.warn('Flashcard not found or access denied:', { flashcardId, userId: user.id });
      return new Response(JSON.stringify({ error: 'Flashcard not found or access denied' }), { status: 404 });
    }

    logger.info('Flashcard updated successfully:', { flashcardId });
    return new Response(JSON.stringify(updatedFlashcard), { status: 200 });

  } catch (error) {
    logger.error('Error updating flashcard:', { error });
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}

export const DELETE: APIRoute = async ({ params, request, cookies }) => {
  try {
    const supabase = createSupabaseServerInstance({ request, cookies });
    const flashcardService = new FlashcardService(supabase);
    
    // Get user from auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // Validate flashcard ID
    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing flashcard ID' }), { status: 400 });
    }

    // Delete flashcard
    const success = await flashcardService.deleteFlashcard(id, user.id);
    if (!success) {
      return new Response(JSON.stringify({ error: 'Flashcard not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true }));
  } catch (error) {
    console.error('Error deleting flashcard:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}; 