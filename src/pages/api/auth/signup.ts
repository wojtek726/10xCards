import type { APIRoute } from "astro";
import { z } from "zod";
import { logger } from '../../../lib/services/logger.service';

const signUpSchema = z.object({
  email: z.string().email("Nieprawidłowy adres email"),
  password: z.string().min(8, "Hasło musi mieć minimum 8 znaków"),
});

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    const { email, password } = signUpSchema.parse(body);

    // Używamy instancji supabase z locals
    const supabase = locals.supabase;

    // 1. Rejestrujemy użytkownika używając standardowej metody signUp
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${import.meta.env.SITE_URL}/auth/callback`,
      },
    });

    if (authError) {
      logger.error("Supabase Auth Error:", authError);
      return new Response(
        JSON.stringify({
          error: "Błąd podczas rejestracji: " + authError.message,
        }),
        { status: 400 }
      );
    }

    if (!authData.user) {
      return new Response(
        JSON.stringify({
          error: "Nie udało się utworzyć konta - brak danych użytkownika.",
        }),
        { status: 400 }
      );
    }

    // 2. Tworzymy wpis w public.users z tym samym ID
    const { error: dbError } = await locals.supabase.from("users").insert({
      id: authData.user.id,
      email: authData.user.email,
    });

    if (dbError) {
      logger.error("Database Error:", dbError);
      
      // Jeśli błąd dotyczy duplikatu emaila
      if (dbError.code === "23505") {
        return new Response(
          JSON.stringify({
            error: "Ten adres email jest już zajęty.",
          }),
          { status: 400 }
        );
      }

      return new Response(
        JSON.stringify({
          error: "Błąd podczas tworzenia profilu użytkownika.",
          details: dbError.message,
        }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({
        user: authData.user,
        message: "Konto zostało utworzone. Sprawdź swoją skrzynkę email, aby potwierdzić rejestrację.",
      }),
      { status: 200 }
    );
  } catch (err) {
    logger.error("Błąd podczas rejestracji:", err);
    
    if (err instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: "Nieprawidłowe dane wejściowe",
          details: err.errors,
        }),
        { status: 400 }
      );
    }

    return new Response(
      JSON.stringify({
        error: "Wystąpił nieoczekiwany błąd podczas rejestracji.",
      }),
      { status: 500 }
    );
  }
};
