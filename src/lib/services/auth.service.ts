import { AuthError } from '@supabase/supabase-js';
import { supabaseClient } from '@/db/supabase.client';

const ERROR_MESSAGES = {
  'Invalid login credentials': 'Niepoprawny email lub hasło',
  'Email not confirmed': 'Email nie został potwierdzony',
  'Password is too short': 'Hasło jest za krótkie',
  'User already registered': 'Użytkownik o tym adresie email już istnieje',
} as const;

export class AuthService {
  static async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      if (error instanceof AuthError) {
        const message = ERROR_MESSAGES[error.message as keyof typeof ERROR_MESSAGES] || 'Wystąpił błąd podczas logowania';
        return { data: null, error: message };
      }
      return { data: null, error: 'Wystąpił nieoczekiwany błąd' };
    }
  }

  static async signUp(email: string, password: string) {
    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      if (error instanceof AuthError) {
        const message = ERROR_MESSAGES[error.message as keyof typeof ERROR_MESSAGES] || 'Wystąpił błąd podczas rejestracji';
        return { data: null, error: message };
      }
      return { data: null, error: 'Wystąpił nieoczekiwany błąd' };
    }
  }

  static async signOut() {
    try {
      const { error } = await supabaseClient.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: 'Wystąpił błąd podczas wylogowywania' };
    }
  }

  static async getSession() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    return session;
  }
} 