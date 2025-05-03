import { createServerClient } from "@/db/supabase.client";
import type { AstroCookies } from "astro";

export async function getUser(cookies: AstroCookies) {
  const supabase = createServerClient(cookies);
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    console.error("Error fetching user:", error.message);
    return null;
  }

  return user;
}

