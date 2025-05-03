import type { APIRoute } from 'astro';
import { createServerClient } from '@/db/supabase.client';
import { logger } from '@/lib/services/logger.service';
import { z } from 'zod';

// Ensure API route is not prerendered and processed as a server endpoint
export const prerender = false;

// Schemat walidacyjny dla zmiany hasła
const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Aktualne hasło jest wymagane"),
  newPassword: z.string().min(8, "Nowe hasło musi mieć co najmniej 8 znaków"),
});

export const PUT: APIRoute = async ({ request, cookies }) => {
  try {
    const supabase = createServerClient(cookies);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      logger.warn("Próba zmiany hasła bez aktywnej sesji", { error: authError?.message });
      return new Response(
        JSON.stringify({ error: "Brak uprawnień" }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const userId = user.id;
    const userEmail = user.email;

    // Parsujemy dane wejściowe
    const requestData = await request.json();
    
    // Walidacja danych
    const result = updatePasswordSchema.safeParse(requestData);
    if (!result.success) {
      logger.warn("Nieprawidłowe dane do zmiany hasła", {
        userId,
        errors: result.error.format()
      });
      
      return new Response(
        JSON.stringify({ error: "Nieprawidłowe dane", issues: result.error.format() }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { currentPassword, newPassword } = result.data;

    // Weryfikacja aktualnego hasła
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: userEmail as string,
      password: currentPassword
    });

    if (signInError) {
      logger.warn("Nieprawidłowe aktualne hasło przy próbie zmiany hasła", { userId });
      
      return new Response(
        JSON.stringify({ error: "Nieprawidłowe aktualne hasło" }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Aktualizacja hasła
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (updateError) {
      logger.error("Błąd podczas aktualizacji hasła", {
        userId,
        error: updateError.message
      });
      
      return new Response(
        JSON.stringify({ error: "Wystąpił błąd podczas zmiany hasła" }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    logger.info("Hasło użytkownika zostało pomyślnie zmienione", { userId });
    
    return new Response(
      JSON.stringify({ success: true, message: "Hasło zostało zmienione" }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    logger.error("Nieoczekiwany błąd podczas zmiany hasła", { error });
    
    return new Response(
      JSON.stringify({ error: "Wystąpił nieoczekiwany błąd" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const all: APIRoute = ({ request }) => {
  return new Response(null, {
    status: 405,
    headers: {
      'Allow': 'PUT'
    }
  });
}; 