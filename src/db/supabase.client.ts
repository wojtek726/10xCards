import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';
import type { AstroCookies } from "astro";
import { createServerClient as createSupabaseServerClient, type CookieOptionsWithName } from "@supabase/ssr";
import { logger } from '../lib/services/logger.service';

// Get environment variables
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseKey = import.meta.env.PUBLIC_SUPABASE_KEY;
const siteUrl = import.meta.env.SITE_URL || 'http://localhost:3000';

// Check if we're in development
const isDevelopment = siteUrl.includes('localhost') || siteUrl.includes('127.0.0.1');

logger.info("Initializing Supabase with URL:", supabaseUrl);
logger.info("Site URL:", siteUrl);
logger.info("Environment:", isDevelopment ? "Development" : "Production");
logger.info("Service role key present:", !!import.meta.env.SUPABASE_SERVICE_ROLE_KEY);

// Always require Supabase credentials
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing required Supabase environment variables (PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_KEY)');
}

export const AUTH_COOKIE_NAMES = {
  accessToken: 'sb-access-token',
  refreshToken: 'sb-refresh-token',
  authToken: 'supabase-auth-token'
} as const;

export const cookieOptions: CookieOptionsWithName = {
  path: "/",
  secure: !isDevelopment,
  httpOnly: true,
  sameSite: "lax",
  maxAge: 60 * 60 * 24 * 7 // 7 days
};

export function setSecureCookies(cookies: AstroCookies, name: string, value: string, options: Partial<CookieOptionsWithName> = {}) {
  const finalOptions = {
    ...cookieOptions,
    ...options
  };
  
  logger.debug(`Setting cookie ${name} with value length: ${value.length}, secure: ${finalOptions.secure}, domain: ${finalOptions.domain}`);
  cookies.set(name, value, finalOptions);
}

export function clearAuthCookies(cookies: AstroCookies) {
  logger.debug("[Supabase] Clearing auth cookies");
  
  Object.values(AUTH_COOKIE_NAMES).forEach(name => {
    if (cookies.has(name)) {
      cookies.delete(name, { path: cookieOptions.path });
    }
  });
}

export function createSupabaseBrowserClient() {
  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      flowType: 'pkce',
      detectSessionInUrl: true,
      persistSession: true,
    }
  });
}

// Helper function to parse cookies
export function getAllCookies(cookieHeader: string): Record<string, string> {
  const result: Record<string, string> = {};
  if (!cookieHeader) return result;

  const cookies = cookieHeader.split(';').map(c => c.trim());
  cookies.forEach(cookie => {
    const [name, ...restParts] = cookie.split('=');
    if (name && restParts.length > 0) {
      result[name.trim()] = restParts.join('=');
    }
  });

  return result;
}

// Funkcja do tworzenia klienta serwerowego
export function createServerClient(cookies: AstroCookies, useServiceRole = false) {
  logger.debug("[Supabase] Creating server client with cookies present");

  const key = useServiceRole ? import.meta.env.SUPABASE_SERVICE_ROLE_KEY : supabaseKey;
  
  if (useServiceRole && !key) {
    logger.error("[Supabase] Service role key is missing but was requested");
    throw new Error("Service role key is required but not available");
  }

  logger.debug("[Supabase] Creating client with key type:", useServiceRole ? "service_role" : "public");

  return createSupabaseServerClient<Database>(
    supabaseUrl,
    key as string,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      },
      cookies: {
        get: (key) => cookies.get(key)?.value,
        set: (key, value, options) => setSecureCookies(cookies, key, value, options),
        remove: (key, options) => {
          if (cookies.has(key)) {
            cookies.delete(key, { path: options?.path || cookieOptions.path });
          }
        }
      }
    }
  );
}
