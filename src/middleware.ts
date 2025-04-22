import { defineMiddleware } from "astro:middleware";
import type { MiddlewareHandler } from "astro";
import { createSupabaseServerInstance } from "./db/supabase.client";

// List of routes that require authentication
const PROTECTED_ROUTES = [
  "/flashcards",
  "/flashcards/generate",
  "/flashcards/collections",
  "/profile",
  // Add other protected routes here
];

// Define a single middleware function that combines both functionalities
export const onRequest: MiddlewareHandler = defineMiddleware(async (context, next) => {
  // Create server-side Supabase instance
  const supabase = createSupabaseServerInstance(context);
  context.locals.supabase = supabase;

  const { request, redirect, locals } = context;
  const { pathname } = new URL(request.url);

  // Check if the current path requires authentication
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

  if (!isProtectedRoute) {
    return next();
  }

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      // Store the attempted URL to redirect back after login
      const redirectTo = encodeURIComponent(pathname);
      return redirect(`/login?redirectTo=${redirectTo}`);
    }

    // Add user session to locals for use in components
    locals.user = session.user;
    return next();
  } catch (error) {
    console.error('Auth error:', error);
    return redirect('/login');
  }
});
