/// <reference types="astro/client" />

import type { Database } from "./db/database.types";
import type { SupabaseClient, Session, User } from "@supabase/supabase-js";

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient<Database>;
      user?: User;
      session?: Session;
    }
  }
}

interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_KEY: string;
  readonly OPENROUTER_API_KEY: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Rozszerzenie interfejsu Astro.locals o informacje o użytkowniku
declare namespace App {
  interface Locals {
    user?: {
      id: string;
      email: string;
      login: string;
    };
  }
}
