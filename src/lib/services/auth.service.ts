import { supabaseClient } from '@/db/supabase.client';
import type { AuthResponse, SignInDTO, SignUpDTO } from '@/types';

const _ERROR_MESSAGES = {
  'Invalid login credentials': 'Niepoprawny email lub hasło',
  'Email not confirmed': 'Email nie został potwierdzony',
  'Password is too short': 'Hasło jest za krótkie',
  'User already registered': 'Użytkownik o tym adresie email już istnieje',
} as const;

export class AuthService {
  static async signIn(credentials: SignInDTO): Promise<AuthResponse> {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        login: credentials.email,
        password: credentials.password
      }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Nieprawidłowy email lub hasło");
      }
      throw new Error("Wystąpił błąd podczas logowania");
    }

    return response.json();
  }
  
  static async signUp(userData: SignUpDTO): Promise<AuthResponse> {
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      if (response.status === 400) {
        const data = await response.json();
        throw new Error(data.error || "Nieprawidłowe dane rejestracji");
      }
      throw new Error("Wystąpił błąd podczas rejestracji");
    }

    return response.json();
  }
  
  static async resetPassword(email: string): Promise<void> {
    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      if (response.status === 400) {
        throw new Error("Nieprawidłowy adres email");
      }
      throw new Error("Wystąpił błąd podczas resetowania hasła");
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