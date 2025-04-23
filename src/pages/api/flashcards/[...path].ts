import type { APIRoute } from "astro";
import { FlashcardService } from "../../../lib/services/flashcard.service";
import { createSupabaseServerInstance } from "../../../db/supabase.client";
import { z } from "zod";
import { logger } from '../../../lib/services/logger.service';

// Schemat walidacji dla tworzenia fiszki
const createFlashcardSchema = z.object({
  front: z.string().min(1).max(200),
  back: z.string().min(1).max(500),
  card_origin: z.enum(["manual", "ai", "ai_modified"]),
});

// Schemat walidacji dla aktualizacji fiszki
const updateFlashcardSchema = z.object({
  front: z.string().min(1).max(200).optional(),
  back: z.string().min(1).max(500).optional(),
});

// Schemat walidacji dla parametrów paginacji
const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    const supabase = createSupabaseServerInstance({ request, cookies });
    const flashcardService = new FlashcardService(supabase);

    // Sprawdzamy czy użytkownik jest zalogowany
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const url = new URL(request.url);
    const flashcardId = url.pathname.split("/").pop();

    // Jeśli podano ID fiszki, pobieramy konkretną fiszkę
    if (flashcardId && flashcardId !== "flashcards") {
      const flashcard = await flashcardService.getFlashcard(user.id, flashcardId);
      
      if (!flashcard) {
        return new Response(JSON.stringify({ error: "Flashcard not found" }), {
          status: 404,
        });
      }

      return new Response(JSON.stringify(flashcard));
    }

    // W przeciwnym razie pobieramy listę fiszek z paginacją
    const params = Object.fromEntries(url.searchParams.entries());
    const { page, limit } = paginationSchema.parse(params);

    const result = await flashcardService.getFlashcards(user.id, page, limit);
    return new Response(JSON.stringify(result));
  } catch (error) {
    logger.error("Error in GET /api/flashcards:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
};

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const supabase = createSupabaseServerInstance({ request, cookies });
    const flashcardService = new FlashcardService(supabase);

    // Sprawdzamy czy użytkownik jest zalogowany
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const body = await request.json();
    logger.debug("Received flashcard data:", body);
    
    try {
      const validatedData = createFlashcardSchema.parse(body);
      logger.debug("Validated flashcard data:", validatedData);
      
      const flashcard = await flashcardService.createFlashcard(user.id, validatedData);
      return new Response(JSON.stringify(flashcard), { status: 201 });
    } catch (validationError) {
      logger.error("Validation error details:", validationError);
      if (validationError instanceof z.ZodError) {
        return new Response(
          JSON.stringify({ 
            error: "Validation error", 
            details: validationError.errors,
            received: body 
          }),
          { status: 400 }
        );
      }
      throw validationError;
    }
  } catch (error) {
    logger.error("Error in POST /api/flashcards:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
};

export const PUT: APIRoute = async ({ request, cookies }) => {
  try {
    const supabase = createSupabaseServerInstance({ request, cookies });
    const flashcardService = new FlashcardService(supabase);

    // Sprawdzamy czy użytkownik jest zalogowany
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const url = new URL(request.url);
    const flashcardId = url.pathname.split("/").pop();

    if (!flashcardId || flashcardId === "flashcards") {
      return new Response(
        JSON.stringify({ error: "Flashcard ID is required" }),
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = updateFlashcardSchema.parse(body);

    const flashcard = await flashcardService.updateFlashcard(
      user.id,
      flashcardId,
      validatedData
    );
    return new Response(JSON.stringify(flashcard));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: "Validation error", details: error.errors }),
        { status: 400 }
      );
    }

    logger.error("Error in PUT /api/flashcards:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
};

export const DELETE: APIRoute = async ({ request, cookies }) => {
  try {
    const supabase = createSupabaseServerInstance({ request, cookies });
    const flashcardService = new FlashcardService(supabase);

    // Sprawdzamy czy użytkownik jest zalogowany
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const url = new URL(request.url);
    const flashcardId = url.pathname.split("/").pop();

    if (!flashcardId || flashcardId === "flashcards") {
      return new Response(
        JSON.stringify({ error: "Flashcard ID is required" }),
        { status: 400 }
      );
    }

    await flashcardService.deleteFlashcard(user.id, flashcardId);
    return new Response(null, { status: 204 });
  } catch (error) {
    logger.error("Error in DELETE /api/flashcards:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}; 