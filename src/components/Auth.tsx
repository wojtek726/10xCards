import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabaseClient } from "../db/supabase.client";

export default function AuthComponent() {
  // Get the current URL for redirect
  const redirectTo =
    typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : "http://localhost:54321/auth/callback";

  return (
    <Auth
      supabaseClient={supabaseClient}
      appearance={{ theme: ThemeSupa }}
      providers={["google", "github"]}
      redirectTo={redirectTo}
    />
  );
}
