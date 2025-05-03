import type { APIRoute } from 'astro';
import { createServerClient } from '../../../db/supabase.client';
import { z } from 'zod';
import { logger } from '../../../lib/utils/logger';

export const prerender = false;

const createFlashcardSchema = z.object({
  front: z.string().min(1).max(200),
  back: z.string().min(1).max(500),
  card_origin: z.enum(['manual', 'ai', 'ai_modified']).default('manual'),
});

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const supabase = createServerClient(cookies);

    // Get user from auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      logger.warn('Unauthorized access attempt:', { error: authError });
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // Validate request body
    const body = await request.json();
    const validationResult = createFlashcardSchema.safeParse(body);

    if (!validationResult.success) {
      logger.warn('Invalid request body:', { errors: validationResult.error });
      return new Response(
        JSON.stringify({ error: 'Invalid request body', details: validationResult.error }), 
        { status: 400 }
      );
    }

    // Create flashcard
    const { data: flashcard, error: createError } = await supabase
      .from('flashcards')
      .insert({
        user_id: user.id,
        front: validationResult.data.front,
        back: validationResult.data.back,
        card_origin: validationResult.data.card_origin,
      })
      .select()
      .single();

    if (createError) {
      logger.error('Error creating flashcard:', { error: createError });
      return new Response(
        JSON.stringify({ error: 'Failed to create flashcard' }), 
        { status: 500 }
      );
    }

    logger.info('Flashcard created successfully:', { 
      flashcardId: flashcard.id,
      origin: validationResult.data.card_origin 
    });
    return new Response(JSON.stringify(flashcard), { status: 201 });

  } catch (error) {
    logger.error('Error in POST /api/flashcards:', { error });
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { status: 500 }
    );
  }
}; 