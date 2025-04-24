import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";
import type { AstroCookies } from "astro";
import { createServerClient, type CookieOptionsWithName } from "@supabase/ssr";
import { logger } from '../lib/services/logger.service';

// Get environment variables - handling both naming conventions
// CI uses PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY
// Local dev uses SUPABASE_URL and SUPABASE_KEY
const supabaseUrl = import.meta.env.SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY || import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
const siteUrl = import.meta.env.SITE_URL || 'http://localhost:3000'; // Domyślnie do 3000 zgodnie z konfiguracją

// Sprawdź, czy jesteśmy w środowisku developerskim (localhost)
const isDevelopment = siteUrl.includes('localhost') || siteUrl.includes('127.0.0.1');

logger.info("Inicjalizacja Supabase z adresem URL:", supabaseUrl);
logger.info("Site URL:", siteUrl);
logger.info("Environment:", isDevelopment ? "Development" : "Production");

// Tworzymy klienta tylko jeśli mamy wszystkie potrzebne dane
export const supabaseClient = createBrowserClient<Database>(
  supabaseUrl,
  supabaseAnonKey
);

// Definiujemy nazwy ciasteczek
export const AUTH_COOKIE_NAMES = {
  accessToken: 'sb-access-token',
  refreshToken: 'sb-refresh-token',
  authCookie: 'supabase-auth-token'
};

// Aktualizacja opcji ciasteczek aby upewnić się, że sesja jest poprawnie przechowywana
// Na localhost nie używamy secure, aby ciasteczka działały bez HTTPS
export const cookieOptions: CookieOptionsWithName = {
  path: "/",
  secure: !isDevelopment, // Secure tylko w produkcji, nie na localhost
  httpOnly: true,
  sameSite: "lax",
  maxAge: 60 * 60 * 24 * 7, // 7 dni
};

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

interface CreateSupabaseServerInstanceOptions {
  request: Request;
  cookies: AstroCookies;
  useServiceRole?: boolean;
}

export const createSupabaseServerInstance = ({ request, cookies, useServiceRole = false }: CreateSupabaseServerInstanceOptions) => {
  const requestCookieHeader = request.headers.get("Cookie") || '';
  logger.debug("Creating server instance with cookie header:", requestCookieHeader);
  
  // Analizuj ciasteczka ręcznie
  const allCookies = getAllCookies(requestCookieHeader);
  logger.debug("Parsed cookies:", allCookies);
  
  const accessToken = allCookies[AUTH_COOKIE_NAMES.accessToken];
  const refreshToken = allCookies[AUTH_COOKIE_NAMES.refreshToken];
  
  logger.debug("Found tokens in cookies:", {
    hasAccessToken: !!accessToken,
    hasRefreshToken: !!refreshToken,
  });
  
  const supabase = createServerClient(
    supabaseUrl,
    useServiceRole ? supabaseServiceRoleKey : supabaseAnonKey,
    {
      cookieOptions,
      cookies: {
        getAll() {
          return Object.entries(allCookies).map(([name, value]) => ({ name, value }));
        },
        setAll(cookiesToSet) {
          logger.debug("Setting cookies:", cookiesToSet);
          cookiesToSet.forEach(({ name, value, options }) => {
            logger.debug(`Setting cookie ${name} with options:`, options);
            cookies.set(name, value, options);
          });
        },
      },
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
        flowType: 'pkce',
      },
    }
  );

  return supabase;
};

// Funkcja do ustawiania ciasteczek uwzględniająca specyfikę localhost
export const setSecureCookies = (
  cookies: AstroCookies, 
  name: string, 
  value: string, 
  options: Partial<CookieOptionsWithName> = {}
) => {
  // Zastosuj odpowiednie opcje dla środowiska localhost
  const cookieOpts = {
    ...cookieOptions, // Już zawiera secure: !isDevelopment
    ...options
  };
  
  // W środowisku deweloperskim zawsze wyłączamy secure
  if (isDevelopment) {
    cookieOpts.secure = false;
  }
  
  logger.debug(`Setting cookie ${name} with value length: ${value.length}, secure: ${cookieOpts.secure}`);
  cookies.set(name, value, cookieOpts);
};
