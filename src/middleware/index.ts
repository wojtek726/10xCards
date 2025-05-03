import { defineMiddleware } from "astro:middleware";
import { createServerClient, AUTH_COOKIE_NAMES } from "../db/supabase.client";
import type { User } from '@supabase/supabase-js';
import { logger } from '../lib/services/logger.service';

export const onRequest = defineMiddleware(async (context, next) => {
  const { request, cookies, locals } = context;
  const url = new URL(request.url);
  
  // Bypass authentication checks for test mode
  const isTestMode = 
    url.searchParams.has('test') || 
    request.headers.get('x-test-mode') === 'true' || 
    (typeof process !== 'undefined' && process.env.RUNNING_E2E === 'true');
    
  if (isTestMode) {
    logger.debug(`[Middleware] Test mode detected, bypassing auth checks`);
    if (!url.pathname.startsWith('/auth/login')) {
      locals.user = {
        id: 'test-user-id',
        email: 'test@example.com',
        role: 'authenticated',
        aud: 'authenticated',
        app_metadata: { provider: 'email' },
        user_metadata: {},
        created_at: new Date().toISOString()
      } as User;
    }
    locals.supabase = createServerClient(cookies);
    return next();
  }
  
  // Check if this is a logout request
  const isLogoutProcess = url.pathname === '/api/auth/logout' || 
                         (url.pathname === '/auth/login' && url.searchParams.has('logout'));
  
  logger.debug(`[Middleware] Request to ${url.pathname}${isLogoutProcess ? ' (logout process)' : ''}`);
  
  // Public routes that don't require authentication
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

  const isPublicRoute = publicRoutes.some(route => 
    url.pathname === route || url.pathname.startsWith(route)
  );

  // Lista wszystkich możliwych ciasteczek do wyczyszczenia
  const ALL_POSSIBLE_COOKIES = [
    // Standardowe ciasteczka
    AUTH_COOKIE_NAMES.accessToken,
    AUTH_COOKIE_NAMES.refreshToken,
    AUTH_COOKIE_NAMES.authToken,
    // Stare/alternatywne nazwy
    'sb-access-token',
    'sb-refresh-token',
    'supabase-auth-token',
    'session',
    'supabase-auth-token-name',
    // Lokalne warianty
    'sb-127-auth-token',
    'sb-localhost-auth-token',
    'sb-127.0.0.1-auth-token',
    'sb-localhost.auth-token',
    // Dodatkowe warianty
    'sb.auth.token',
    'sb-auth-token',
    'sb-provider-token',
    // Dodaj tutaj inne warianty jeśli się pojawią
  ];

  // Helper function to clear all auth cookies
  const clearAuthCookies = () => {
    logger.debug(`[Middleware] Clearing ALL auth cookies`);
    ALL_POSSIBLE_COOKIES.forEach(cookieName => {
      try {
        // Usuń ciasteczko standardowo
        cookies.delete(cookieName, { path: '/' });
        
        // Wymuś wygaśnięcie ciasteczka
        cookies.set(cookieName, '', {
          path: '/',
          expires: new Date(0),
          maxAge: 0
        });
        
        // Spróbuj też usunąć z różnymi opcjami path
        ['/auth', '/api', '/api/auth'].forEach(path => {
          cookies.delete(cookieName, { path });
          cookies.set(cookieName, '', {
            path,
            expires: new Date(0),
            maxAge: 0
          });
        });
      } catch (e) {
        logger.warn(`Error clearing cookie ${cookieName}:`, e);
      }
    });
  };

  try {
    // Initialize default values
    locals.user = undefined;

    // Create server-side Supabase client
    const supabase = createServerClient(cookies);
    locals.supabase = supabase;

    // Get user (this validates the session with Supabase Auth server)
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      logger.error(`[Middleware] User error:`, userError);
      clearAuthCookies();
      throw userError;
    }

    if (user) {
      logger.debug(`[Middleware] Valid user found: ${user.id}`);
      // User is authenticated
      locals.user = user;

      // If user is authenticated and tries to access login page, redirect to flashcards
      if (url.pathname === '/auth/login' && !isLogoutProcess) {
        logger.debug(`[Middleware] Authenticated user trying to access login page, redirecting to /flashcards`);
        return Response.redirect(new URL('/flashcards', request.url), 302);
      }
    } else {
      logger.debug(`[Middleware] No valid user found`);
      // Clear invalid cookies if they exist
      if (cookies.get(AUTH_COOKIE_NAMES.accessToken) || cookies.get(AUTH_COOKIE_NAMES.refreshToken)) {
        clearAuthCookies();
      }
    }

    // Handle protected routes
    if (!user && !isPublicRoute) {
      logger.debug(`[Middleware] No user found, redirecting to login`);
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect_to', url.pathname);
      return Response.redirect(loginUrl, 302);
    }

  } catch (error) {
    logger.error(`[Middleware] Error checking user:`, error);
    // Clear cookies on error
    clearAuthCookies();
    
    if (!isPublicRoute) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('session_expired', 'true');
      return Response.redirect(loginUrl, 302);
    }
  }

  return next();
});