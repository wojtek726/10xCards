import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.client";
import { logger } from '../../../lib/services/logger.service';

// Rozszerzamy listę ciasteczek do usunięcia, aby uwzględnić wszystkie możliwe warianty
const COOKIES_TO_DELETE = [
  'sb-access-token',
  'sb-refresh-token',
  'supabase-auth-token',
  'session',
  'supabase-auth-token-name',
  'sb-127-auth-token',
  'sb-localhost-auth-token',
  'sb-127.0.0.1-auth-token',
  'sb-localhost.auth-token'
] as const;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    logger.info("Logout endpoint called - removing all auth cookies");
    
    // Sprawdź czy jesteśmy w środowisku developerskim (bez HTTPS)
    const isDevelopment = request.url.includes('localhost') || request.url.includes('127.0.0.1');
    
    // 1. Usuń wszystkie ciasteczka związane z sesją
    COOKIES_TO_DELETE.forEach(cookieName => {
      // Najpierw usuwamy standardowo
      cookies.delete(cookieName, { 
        path: "/",
        secure: !isDevelopment, // Secure tylko w środowisku produkcyjnym
        httpOnly: true,
        sameSite: "lax"
      });
      
      // A potem dodatkowo ustawiamy puste wartości z wygasłą datą
      cookies.set(cookieName, "", { 
        path: "/",
        secure: !isDevelopment, // Secure tylko w środowisku produkcyjnym
        httpOnly: true,
        sameSite: "lax",
        expires: new Date(0) // Ustawienie daty w przeszłości wymusza natychmiastowe wygaśnięcie
      });
    });

    // 2. Spróbuj wyczyścić sesję w Supabase (ale nie przejmuj się błędami)
    try {
      const supabase = createSupabaseServerInstance({ request, cookies });
      await supabase.auth.signOut({ scope: 'global' }); // Użyj scope: 'global' aby wylogować ze wszystkich urządzeń
    } catch (error) {
      logger.warn('Supabase signOut error (ignorowany):', error);
    }

    // 3. Dodaj nagłówki zapobiegające cachowaniu i wymuszające wyczyszczenie danych
    const headers = new Headers({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Clear-Site-Data': '"cookies", "storage", "cache"'
    });

    logger.info("Logout successful - all cookies cleared");
    
    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200,
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
        cookies.delete(cookieName, { 
          path: "/", 
          secure: !isDevelopment 
        });
        cookies.set(cookieName, "", { 
          path: "/",
          secure: !isDevelopment,
          expires: new Date(0)
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
        status: 200, // Zwracamy 200 zamiast 500, ponieważ najważniejsze dane sesji zostały wyczyszczone
        headers: {
          'Clear-Site-Data': '"cookies", "storage", "cache"'
        }
      }
    );
  }
}; 