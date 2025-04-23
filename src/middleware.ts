import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerInstance, AUTH_COOKIE_NAMES } from "./db/supabase.client";
import type { User } from '@supabase/supabase-js';
import { logger } from './lib/services/logger.service';

export const onRequest = defineMiddleware(async (context, next) => {
  const { request, cookies, locals } = context;
  const url = new URL(request.url);
  
  // Bypass authentication checks for test mode 
  const isTestMode = url.searchParams.has('test') || request.headers.get('x-test-mode') === 'true';
  if (isTestMode) {
    logger.debug(`[Middleware] Test mode detected, bypassing auth checks`);
    // Use mock user in test mode
    locals.user = {
      id: 'test-user-id',
      email: 'test@example.com',
      role: 'authenticated',
      aud: 'authenticated',
      app_metadata: { provider: 'email' },
      user_metadata: {}
    } as User;
    
    // Add Supabase instance to locals
    locals.supabase = createSupabaseServerInstance({ request, cookies });
    
    // Continue to the endpoint without auth checks
    return next();
  }
  
  // Sprawdź czy to żądanie jest częścią procesu wylogowania
  const isLogoutProcess = url.pathname === '/api/auth/logout' || 
                          (url.pathname === '/auth/login' && url.searchParams.has('logout'));
  
  // Logowanie podstawowych informacji dla każdego żądania  
  logger.debug(`[Middleware] Request to ${url.pathname}${isLogoutProcess ? ' (logout process)' : ''}`);
  logger.debug(`[Middleware] Cookie count: ${request.headers.get("cookie")?.split(";").length || 0}`);

  // Utwórz instancję Supabase dla serwera
  const supabase = createSupabaseServerInstance({ request, cookies });

  // Inicjalizacja wartości domyślnych
  locals.user = undefined;
  locals.supabase = supabase;

  // Trasy publiczne, które nie wymagają autoryzacji
  const publicRoutes = [
    "/auth/login",
    "/auth/register",
    "/auth/signup",
    "/auth/reset-password",
    "/api/auth/login",
    "/api/auth/signup",
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
      logger.debug(`[Middleware] Checking session for ${url.pathname}`);
      
      // Sprawdź, czy ciasteczka sesji są obecne
      const hasAccessToken = cookies.has(AUTH_COOKIE_NAMES.accessToken);
      const hasRefreshToken = cookies.has(AUTH_COOKIE_NAMES.refreshToken);
      logger.debug(`[Middleware] Session cookies present: access=${hasAccessToken}, refresh=${hasRefreshToken}`);

      // Pobierz sesję
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        logger.error(`[Middleware] Session error:`, sessionError);
      }

      if (session) {
        logger.debug(`[Middleware] Valid session found, token expires in: ${session.expires_in}s`);
        
        // Pobierz dane użytkownika
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          logger.error(`[Middleware] User error:`, userError);
        }
        
        if (user) {
          logger.debug(`[Middleware] User authenticated: ${user.id} (${user.email})`);
          locals.user = user;
        } else {
          logger.debug(`[Middleware] Session exists but no user found`);
        }
      } else {
        logger.debug(`[Middleware] No valid session found`);
        
        // Jeśli ciasteczka są obecne, ale sesja nie istnieje, spróbuj odświeżyć
        if (hasAccessToken && hasRefreshToken) {
          logger.debug(`[Middleware] Attempting to refresh session`);
          const refreshToken = cookies.get(AUTH_COOKIE_NAMES.refreshToken)?.value;
          
          if (refreshToken) {
            try {
              const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession({
                refresh_token: refreshToken
              });
              
              if (refreshError) {
                logger.error(`[Middleware] Session refresh error:`, refreshError);
              } else if (refreshData.session && refreshData.user) {
                logger.debug(`[Middleware] Session refreshed successfully`);
                locals.user = refreshData.user;
              }
            } catch (refreshErr) {
              logger.error(`[Middleware] Error during session refresh:`, refreshErr);
            }
          }
        }
      }

      // Przekieruj do logowania jeśli użytkownik nie jest uwierzytelniony i trasa wymaga autoryzacji
      if (!locals.user && !isPublicRoute) {
        logger.debug(`[Middleware] Redirecting unauthenticated user from ${url.pathname} to /auth/login`);
        return Response.redirect(new URL("/auth/login", request.url), 302);
      }
    } catch (err) {
      logger.error(`[Middleware] Authentication error:`, err);
      return Response.redirect(new URL("/auth/login", request.url), 302);
    }
  }

  // Wywołaj kolejne middleware lub handler końcowy
  const response = await next();
  return response;
});