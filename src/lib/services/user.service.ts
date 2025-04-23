import { createHash } from "crypto";
import { supabaseClient } from "@/db/supabase.client";
import type { Database } from "../../db/database.types";

type _User = Database["public"]["Tables"]["users"]["Insert"];

// Helper to hash passwords using MD5
const hashPassword = (password: string): string => {
  return createHash("md5").update(password).digest("hex");
};

export const userService = {
  async signUp(email: string, password: string, login: string) {
    // 1. Create auth user in Supabase
    const { data: authData, error: authError } = await supabaseClient.auth.signUp({
      email,
      password,
    });

    if (authError) {
      throw new Error(`Auth error: ${authError.message}`);
    }

    if (!authData.user) {
      throw new Error("No user data returned from auth signup");
    }

    // 2. Create user record in our users table
    const { error: dbError } = await supabaseClient.from("users").insert({
      id: authData.user.id, // Use the same ID as auth user
      login,
      hash_password: hashPassword(password),
    });

    if (dbError) {
      // If database insert fails, we should clean up the auth user
      await supabaseClient.auth.admin.deleteUser(authData.user.id);
      throw new Error(`Database error: ${dbError.message}`);
    }

    return authData;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(`Sign in error: ${error.message}`);
    }

    return data;
  },

  async signOut() {
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
      throw new Error(`Sign out error: ${error.message}`);
    }
  },

  async getCurrentUser() {
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return null;
    }

    const { data: dbUser } = await supabaseClient.from("users").select("*").eq("id", user.id).single();

    return {
      ...user,
      ...dbUser,
    };
  },
};
