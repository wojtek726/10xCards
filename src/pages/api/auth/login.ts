import type { APIRoute } from "astro";
import { createSupabaseServerInstance, setSecureCookies, AUTH_COOKIE_NAMES } from "../../../db/supabase.client";
import { logger } from '../../../lib/services/logger.service';

export const POST: APIRoute = async ({ request, cookies }) => {
  logger.info("Login API endpoint started");
  try {
    const { login, password } = await request.json();
    logger.info("Received login request for email:", login);

    const supabase = createSupabaseServerInstance({ request, cookies });

    // 1. Logujemy użytkownika używając pełnego adresu email
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: login,
      password,
    });

    if (authError) {
      logger.error("Supabase Auth Error:", authError);
      return new Response(
        JSON.stringify({
          error: authError.message,
        }),
        { status: 400 }
      );
    }

    if (!authData.user || !authData.session) {
      logger.error("No user or session data returned");
      return new Response(
        JSON.stringify({
          error: "Nie udało się zalogować.",
        }),
        { status: 400 }
      );
    }

    logger.info("User authenticated successfully:", {
      id: authData.user.id,
      email: authData.user.email,
      tokenLength: authData.session.access_token.length,
    });

    // 2. Sprawdzamy czy użytkownik ma wpis w public.users
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select()
      .eq("id", authData.user.id)
      .single();

    // Jeśli nie ma wpisu w public.users lub wystąpił błąd "not found", tworzymy go
    if (!userData || (userError && userError.code === "PGRST116")) {
      logger.info("Creating new user record in database:", {
        id: authData.user.id,
        email: login,
      });

      await supabase
        .from("users")
        .insert({
          id: authData.user.id,
          email: login,
        });
    }

    // 3. Ręcznie ustawiamy ciasteczka sesji
    const cookieOptions = {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "lax" as const,
      maxAge: 60 * 60 * 24 * 7, // 7 dni
    };

    // Ustawiamy ciasteczka
    setSecureCookies(cookies, AUTH_COOKIE_NAMES.accessToken, authData.session.access_token, cookieOptions);
    setSecureCookies(cookies, AUTH_COOKIE_NAMES.refreshToken, authData.session.refresh_token, cookieOptions);
    
    // Ustawiamy też tradycyjne ciasteczko supabase-auth-token używane przez starsze wersje SDK
    const authTokenValue = JSON.stringify({
      access_token: authData.session.access_token,
      refresh_token: authData.session.refresh_token,
    });
    setSecureCookies(cookies, AUTH_COOKIE_NAMES.authCookie, authTokenValue, cookieOptions);

    // 4. Dodajemy ciasteczka do nagłówków odpowiedzi
    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    
    // Sprawdź czy jesteśmy w środowisku developerskim (bez HTTPS)
    const isDevelopment = request.url.includes('localhost') || request.url.includes('127.0.0.1');
    
    // Dopełniamy ciasteczka nagłówkiem Set-Cookie
    const cookieHeader = (name: string, value: string) => {
      // Na localhost nie ustawiamy flagi Secure
      const secureFlag = isDevelopment ? '' : 'Secure; ';
      return `${name}=${value}; Path=${cookieOptions.path}; Max-Age=${cookieOptions.maxAge}; ${secureFlag}HttpOnly; SameSite=${cookieOptions.sameSite}`;
    };
    
    headers.append("Set-Cookie", cookieHeader(AUTH_COOKIE_NAMES.accessToken, authData.session.access_token));
    headers.append("Set-Cookie", cookieHeader(AUTH_COOKIE_NAMES.refreshToken, authData.session.refresh_token));
    headers.append("Set-Cookie", cookieHeader(AUTH_COOKIE_NAMES.authCookie, authTokenValue));

    // Sprawdzamy czy ciasteczka zostały ustawione
    logger.debug("Cookies set:", { 
      accessToken: cookies.has(AUTH_COOKIE_NAMES.accessToken),
      refreshToken: cookies.has(AUTH_COOKIE_NAMES.refreshToken),
      authCookie: cookies.has(AUTH_COOKIE_NAMES.authCookie)
    });

    return new Response(
      JSON.stringify({
        user: authData.user,
        session: {
          access_token: authData.session.access_token,
          refresh_token: authData.session.refresh_token
        },
        expiresIn: authData.session.expires_in
      }),
      { 
        status: 200,
        headers
      }
    );
  } catch (err) {
    logger.error("Authentication error:", err);
    return new Response(
      JSON.stringify({
        error: "Wystąpił nieoczekiwany błąd podczas logowania.",
      }),
      { status: 500 }
    );
  }
}; 