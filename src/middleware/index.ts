import { defineMiddleware } from "astro:middleware";
import type { MiddlewareHandler } from "astro";

import { supabaseClient } from "../db/supabase.client";

export const onRequest: MiddlewareHandler = defineMiddleware((context, next) => {
  context.locals.supabase = supabaseClient;
  return next();
});
