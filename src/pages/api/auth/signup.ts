import type { APIRoute } from "astro";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const signUpSchema = z.object({
  email: z.string().email("Nieprawidłowy adres email"),
  password: z.string().min(8, "Hasło musi mieć minimum 8 znaków"),
});

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    const { email, password } = signUpSchema.parse(body);

    // Używamy regularnego klienta Supabase
    const supabase = createClient(
      import.meta.env.SUPABASE_URL,
      import.meta.env.SUPABASE_KEY
    );

    // 1. Rejestrujemy użytkownika używając standardowej metody signUp
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${import.meta.env.SITE_URL}/auth/callback`,
      },
    });

    if (authError) {
      console.error("Supabase Auth Error:", authError);
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
      console.error("Database Error:", dbError);
      
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
    console.error("Błąd podczas rejestracji:", err);
    
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
