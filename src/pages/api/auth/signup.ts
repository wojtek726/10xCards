import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.client";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { login, password } = await request.json();

    const supabase = createSupabaseServerInstance({ request, cookies });

    const { data, error } = await supabase.auth.signUp({
      email: `${login}@10xcards.com`, // używamy spójnej domeny dla wszystkich użytkowników
      password,
      options: {
        emailRedirectTo: `${import.meta.env.SITE_URL}/auth/callback`,
        data: {
          login,
        },
      },
    });

    if (error) {
      console.error("Supabase Auth Error:", error);
      return new Response(
        JSON.stringify({
          error: error.message,
        }),
        { status: 400 }
      );
    }

    if (!data.user) {
      return new Response(
        JSON.stringify({
          error: "Nie udało się utworzyć konta.",
        }),
        { status: 400 }
      );
    }

    return new Response(
      JSON.stringify({
        user: data.user,
        message: "Konto zostało utworzone. Możesz się teraz zalogować.",
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Błąd podczas rejestracji:", err);
    return new Response(
      JSON.stringify({
        error: "Wystąpił nieoczekiwany błąd podczas rejestracji.",
      }),
      { status: 500 }
    );
  }
};
