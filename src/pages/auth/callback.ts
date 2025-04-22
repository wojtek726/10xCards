import type { APIRoute } from "astro";
import { supabaseClient } from "../../db/supabase.client";

export const GET: APIRoute = async ({ url, redirect }) => {
  const code = url.searchParams.get("code");

  if (!code) {
    return redirect("/login");
  }

  const { error } = await supabaseClient.auth.exchangeCodeForSession(code);

  if (error) {
    return redirect("/login?error=Unable to authenticate");
  }

  return redirect("/");
};
