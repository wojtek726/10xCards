import type { APIRoute } from "astro";
import { createServerClient, setSecureCookies, AUTH_COOKIE_NAMES } from "../../../db/supabase.client";
import { logger } from '../../../lib/services/logger.service';

export const POST: APIRoute = async ({ request, cookies }) => {
  logger.info("Login API endpoint started");
  try {
    const body = await request.json();
    logger.info("Received login request body:", body);
    const { email, password } = body;
    logger.info("Extracted email and password from request");

    // Handle test mode
    if (process.env.NODE_ENV === 'test' && email.startsWith('test-') && email.endsWith('@example.com')) {
      logger.info("Test mode detected, bypassing Supabase auth");
      
      const testUser = {
        id: `test-user-${Date.now()}`,
        email,
        access_token: `test-access-token-${Date.now()}`,
        refresh_token: `test-refresh-token-${Date.now()}`
      };

      // Set cookies
      const cookieOptions = {
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "lax" as const,
        maxAge: 60 * 60 * 24 * 7, // 7 days
      };

      setSecureCookies(cookies, AUTH_COOKIE_NAMES.accessToken, testUser.access_token, cookieOptions);
      setSecureCookies(cookies, AUTH_COOKIE_NAMES.refreshToken, testUser.refresh_token, cookieOptions);
      
      const authTokenValue = JSON.stringify({
        access_token: testUser.access_token,
        refresh_token: testUser.refresh_token,
      });
      setSecureCookies(cookies, AUTH_COOKIE_NAMES.authToken, authTokenValue, cookieOptions);

      // Return success response
      return new Response(
        JSON.stringify({
          user: {
            id: testUser.id,
            email: testUser.email
          },
          session: {
            access_token: testUser.access_token,
            refresh_token: testUser.refresh_token,
            expires_in: 3600
          }
        }),
        { status: 200 }
      );
    }

    const supabase = createServerClient(cookies);
    
    // Dodajemy log przed wywołaniem signInWithPassword
    logger.info("Attempting to sign in with Supabase auth using email:", email);

    // 1. Logujemy użytkownika używając pełnego adresu email
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
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
      logger.info("No existing user record found in database, creating new one:", {
        id: authData.user.id,
        email: email,
      });
      
      logger.debug("User data from auth:", authData.user);
      if (userError) {
        logger.debug("User error from database query:", userError);
      }

      const { data: insertData, error: insertError } = await supabase
        .from("users")
        .insert({
          id: authData.user.id,
          email: email,
        })
        .select();
        
      if (insertError) {
        logger.error("Error inserting user record:", insertError);
      } else {
        logger.info("Successfully created user record:", insertData);
      }
    } else {
      logger.info("Existing user record found:", userData);
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
    setSecureCookies(cookies, AUTH_COOKIE_NAMES.authToken, authTokenValue, cookieOptions);

    // Sprawdzamy czy ciasteczka zostały ustawione
    logger.debug("Cookies set:", { 
      accessToken: cookies.has(AUTH_COOKIE_NAMES.accessToken),
      refreshToken: cookies.has(AUTH_COOKIE_NAMES.refreshToken),
      authToken: cookies.has(AUTH_COOKIE_NAMES.authToken)
    });

    return new Response(
      JSON.stringify({
        user: authData.user,
        session: {
          access_token: authData.session.access_token,
          refresh_token: authData.session.refresh_token,
          expires_in: authData.session.expires_in
        }
      }),
      { status: 200 }
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