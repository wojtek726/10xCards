import type { APIRoute } from "astro";
import { createServerClient } from "../../../db/supabase.client";
import { FlashcardService } from "../../../lib/services/flashcard.service";
import { logger } from '../../../lib/services/logger.service';
import { z } from "zod";

// Schemat walidacji dla tworzenia fiszki
const createFlashcardSchema = z.object({
  front: z.string().min(1, "Front is required"),
  back: z.string().min(1, "Back is required"),
  card_origin: z.enum(["manual", "ai", "ai_modified"]).default("manual"),
});

// Schemat walidacji dla aktualizacji fiszki
const updateFlashcardSchema = z.object({
  front: z.string().min(1, "Front is required"),
  back: z.string().min(1, "Back is required"),
});

// Schemat walidacji dla parametrów paginacji
const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    const supabase = createServerClient(cookies);
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

    const flashcard = await flashcardService.getFlashcard(user.id, flashcardId);
    if (!flashcard) {
      return new Response(JSON.stringify({ error: "Flashcard not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(flashcard), { status: 200 });
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
    const supabase = createServerClient(cookies);
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
    const result = createFlashcardSchema.safeParse(body);

    if (!result.success) {
      return new Response(
        JSON.stringify({ error: "Invalid request data", issues: result.error.format() }),
        { status: 400 }
      );
    }

    const flashcard = await flashcardService.createFlashcard(user.id, result.data);
    return new Response(JSON.stringify(flashcard), { status: 201 });
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
    const supabase = createServerClient(cookies);
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
    const result = updateFlashcardSchema.safeParse(body);

    if (!result.success) {
      return new Response(
        JSON.stringify({ error: "Invalid request data", issues: result.error.format() }),
        { status: 400 }
      );
    }

    try {
      const flashcard = await flashcardService.updateFlashcard(flashcardId, user.id, result.data);
      return new Response(JSON.stringify(flashcard), { status: 200 });
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'PGRST116') {
        return new Response(JSON.stringify({ error: "Flashcard not found" }), { status: 404 });
      }
      throw error;
    }
  } catch (error) {
    logger.error("Error in PUT /api/flashcards:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
};

export const DELETE: APIRoute = async ({ request, cookies }) => {
  try {
    const supabase = createServerClient(cookies);
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