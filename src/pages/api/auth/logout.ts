import type { APIRoute } from "astro";
import { createServerClient, AUTH_COOKIE_NAMES } from "../../../db/supabase.client";
import { logger } from '../../../lib/services/logger.service';

// Rozszerzamy listę ciasteczek do usunięcia, aby uwzględnić wszystkie możliwe warianty
const COOKIES_TO_DELETE = [
  AUTH_COOKIE_NAMES.accessToken,
  AUTH_COOKIE_NAMES.refreshToken,
  AUTH_COOKIE_NAMES.authToken,
  'session',
  'supabase-auth-token-name',
  'sb-127-auth-token',
  'sb-localhost-auth-token',
  'sb-127.0.0.1-auth-token',
  'sb-localhost.auth-token',
  'sb.auth.token',
  'sb-auth-token',
  'sb-provider-token'
] as const;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    logger.info("Logout endpoint called - removing all auth cookies");
    
    // 1. Najpierw wylogowujemy z Supabase
    const supabase = createServerClient(cookies, true); // useServiceRole = true
    const { error: signOutError } = await supabase.auth.signOut({ scope: 'global' });
    
    if (signOutError) {
      logger.error("Error signing out from Supabase:", signOutError);
      // Kontynuujemy mimo błędu, aby wyczyścić ciasteczka
    }

    // 2. Sprawdzamy czy sesja została wyczyszczona
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (user) {
      logger.warn("User still exists after signOut, forcing cleanup");
      // Wymuszamy wyczyszczenie sesji
      await supabase.auth.admin.signOut(user.id);
    }
    
    // 3. Sprawdź czy jesteśmy w środowisku developerskim (bez HTTPS)
    const isDevelopment = request.url.includes('localhost') || request.url.includes('127.0.0.1');
    
    // 4. Usuń wszystkie ciasteczka związane z sesją
    COOKIES_TO_DELETE.forEach(cookieName => {
      try {
        // Usuń ciasteczko standardowo
        cookies.delete(cookieName, { path: '/' });
        
        // Wymuś wygaśnięcie ciasteczka
        cookies.set(cookieName, '', {
          path: '/',
          expires: new Date(0),
          maxAge: 0,
          secure: !isDevelopment,
          httpOnly: true,
          sameSite: "lax"
        });
        
        // Spróbuj też usunąć z różnymi opcjami path
        ['/auth', '/api', '/api/auth'].forEach(path => {
          cookies.delete(cookieName, { path });
          cookies.set(cookieName, '', {
            path,
            expires: new Date(0),
            maxAge: 0,
            secure: !isDevelopment,
            httpOnly: true,
            sameSite: "lax"
          });
        });
      } catch (e) {
        logger.warn(`Error clearing cookie ${cookieName}:`, e);
      }
    });

    // 5. Dodaj nagłówki zapobiegające cachowaniu i wymuszające wyczyszczenie danych
    const headers = new Headers({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Clear-Site-Data': '"cookies", "storage", "cache"',
      'Location': '/auth/login?logout=true'
    });

    logger.info("Logout successful - all cookies cleared");
    
    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 302,
        headers
      }
    );
  } catch (err) {
    logger.error("Błąd podczas wylogowywania:", err);
    
    // Sprawdź czy jesteśmy w środowisku developerskim (bez HTTPS)
    const isDevelopment = request.url.includes('localhost') || request.url.includes('127.0.0.1');
    
    // Nawet w przypadku błędu, spróbujmy wyczyścić ciasteczka
    COOKIES_TO_DELETE.forEach(cookieName => {
      try {
        cookies.delete(cookieName, { path: '/' });
        cookies.set(cookieName, '', {
          path: '/',
          expires: new Date(0),
          maxAge: 0,
          secure: !isDevelopment,
          httpOnly: true,
          sameSite: "lax"
        });
      } catch (e) {
        logger.error(`Błąd podczas usuwania ciasteczka ${cookieName}:`, e);
      }
    });

    return new Response(
      JSON.stringify({
        error: "Wystąpił błąd podczas wylogowywania, ale sesja została wyczyszczona.",
      }),
      { 
        status: 302,
        headers: {
          'Clear-Site-Data': '"cookies", "storage", "cache"',
          'Location': '/auth/login?logout=true'
        }
      }
    );
  }
}; 