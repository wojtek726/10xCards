import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerInstance, AUTH_COOKIE_NAMES } from "./db/supabase.client";
import type { User } from '@supabase/supabase-js';

export const onRequest = defineMiddleware(async (context, next) => {
  const { request, cookies, locals } = context;
  const url = new URL(request.url);
  
  // Sprawdź czy to żądanie jest częścią procesu wylogowania
  const isLogoutProcess = url.pathname === '/api/auth/logout' || 
                          (url.pathname === '/auth/login' && url.searchParams.has('logout'));
  
  // Logowanie podstawowych informacji dla każdego żądania  
  console.log(`[Middleware] Request to ${url.pathname}${isLogoutProcess ? ' (logout process)' : ''}`);
  console.log(`[Middleware] Cookie count: ${request.headers.get("cookie")?.split(";").length || 0}`);

  // Utwórz instancję Supabase dla serwera
  const supabase = createSupabaseServerInstance({ request, cookies });

  // Inicjalizacja wartości domyślnych
  locals.user = undefined;
  locals.supabase = supabase;

  // Trasy publiczne, które nie wymagają autoryzacji
  const publicRoutes = [
    "/auth/login",
    "/auth/register",
    "/auth/reset-password",
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/reset-password",
    "/api/auth/logout",
    "/images",
    "/css",
    "/js",
    "/fonts",
    "/_astro"
  ];

  // Sprawdź, czy bieżąca ścieżka jest publiczna
  const isPublicRoute = publicRoutes.some(route => 
    url.pathname === route || url.pathname.startsWith(route)
  );

  // Waliduj sesję tylko jeśli nie jest to trasa publiczna i nie jest to proces wylogowania
  if (!isPublicRoute && !isLogoutProcess) {
    try {
      // Pobierz sesję z Supabase
      console.log(`[Middleware] Checking session for ${url.pathname}`);
      
      // Sprawdź, czy ciasteczka sesji są obecne
      const hasAccessToken = cookies.has(AUTH_COOKIE_NAMES.accessToken);
      const hasRefreshToken = cookies.has(AUTH_COOKIE_NAMES.refreshToken);
      console.log(`[Middleware] Session cookies present: access=${hasAccessToken}, refresh=${hasRefreshToken}`);

      // Pobierz sesję
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error(`[Middleware] Session error:`, sessionError);
      }

      if (session) {
        console.log(`[Middleware] Valid session found, token expires in: ${session.expires_in}s`);
        
        // Pobierz dane użytkownika
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error(`[Middleware] User error:`, userError);
        }
        
        if (user) {
          console.log(`[Middleware] User authenticated: ${user.id} (${user.email})`);
          locals.user = user;
        } else {
          console.log(`[Middleware] Session exists but no user found`);
        }
      } else {
        console.log(`[Middleware] No valid session found`);
        
        // Jeśli ciasteczka są obecne, ale sesja nie istnieje, spróbuj odświeżyć
        if (hasAccessToken && hasRefreshToken) {
          console.log(`[Middleware] Attempting to refresh session`);
          const refreshToken = cookies.get(AUTH_COOKIE_NAMES.refreshToken)?.value;
          
          if (refreshToken) {
            try {
              const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession({
                refresh_token: refreshToken
              });
              
              if (refreshError) {
                console.error(`[Middleware] Session refresh error:`, refreshError);
              } else if (refreshData.session && refreshData.user) {
                console.log(`[Middleware] Session refreshed successfully`);
                locals.user = refreshData.user;
              }
            } catch (refreshErr) {
              console.error(`[Middleware] Error during session refresh:`, refreshErr);
            }
          }
        }
      }

      // Przekieruj do logowania jeśli użytkownik nie jest uwierzytelniony i trasa wymaga autoryzacji
      if (!locals.user && !isPublicRoute) {
        console.log(`[Middleware] Redirecting unauthenticated user from ${url.pathname} to /auth/login`);
        return Response.redirect(new URL("/auth/login", request.url), 302);
      }
    } catch (err) {
      console.error(`[Middleware] Authentication error:`, err);
      return Response.redirect(new URL("/auth/login", request.url), 302);
    }
  }

  // Wywołaj kolejne middleware lub handler końcowy
  const response = await next();
  return response;
});
