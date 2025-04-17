import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";
import type { Database } from "./database.types";

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

const DEFAULT_USER = {
  login: "default_user",
  password: "default_password",
};

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper to hash passwords using MD5
const hashPassword = (password: string): string => {
  return createHash("md5").update(password).digest("hex");
};

// Ensure default user exists
export const ensureDefaultUser = async () => {
  const hashedPassword = hashPassword(DEFAULT_USER.password);

  const { data: existingUser, error: searchError } = await supabaseClient
    .from("users")
    .select("id")
    .eq("login", DEFAULT_USER.login)
    .single();

  if (searchError || !existingUser) {
    const { data: newUser, error: createError } = await supabaseClient
      .from("users")
      .insert({
        login: DEFAULT_USER.login,
        hash_password: hashedPassword,
      })
      .select("id")
      .single();

    if (createError) {
      console.error("Failed to create default user:", createError);
      throw createError;
    }

    return newUser;
  }

  return existingUser;
};
