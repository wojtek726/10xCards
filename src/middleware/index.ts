import { defineMiddleware } from "astro:middleware";
import type { APIContext } from "astro";
import { createSupabaseServerInstance } from "@/db/supabase.client";

import { supabaseClient } from "../db/supabase.client";

// List of public routes that don't require authentication
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/signup",
  "/auth/callback",
  // Add other public routes here
];

// Protected routes that require authentication
const PROTECTED_ROUTES = [
  "/flashcards",
  "/flashcards/generate",
  "/flashcards/collections",
];

export const onRequest = defineMiddleware(async (context: APIContext, next) => {
  const { request, redirect, locals } = context;
  const { pathname } = new URL(request.url);

  // Create server-side Supabase instance
  const supabase = createSupabaseServerInstance(context);
  
  try {
    // Get the session
    const { data: { session } } = await supabase.auth.getSession();

    // Add user to locals if session exists
    if (session?.user) {
      locals.user = session.user;
    }

    // Check if the current path requires authentication
    const isProtectedRoute = PROTECTED_ROUTES.some(route => 
      pathname === route || pathname.startsWith(`${route}/`)
    );

    if (isProtectedRoute && !session) {
      // Store the attempted URL to redirect back after login
      const redirectTo = encodeURIComponent(pathname);
      return redirect(`/auth/login?redirectTo=${redirectTo}`);
    }

    return next();
  } catch (error) {
    console.error('Auth error:', error);
    return redirect('/auth/login');
  }
});
