import type { AuthResponse, SignInDTO, SignUpDTO } from '@/types';
import { logger } from '@/lib/utils/logger';

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
        email: credentials.email,
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
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Wystąpił błąd podczas wylogowywania");
      }

      return { error: null };
    } catch (error) {
      return { error: 'Wystąpił błąd podczas wylogowywania' };
    }
  }

  static async getSession() {
    const response = await fetch("/api/auth/session", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return null;
    }

    const { session } = await response.json();
    return session;
  }

  /**
   * Zmienia hasło użytkownika
   * @param currentPassword Aktualne hasło
   * @param newPassword Nowe hasło
   * @returns Promise rozwiązywany do boolean wskazującego sukces lub porażkę
   */
  static async changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      logger.info("Rozpoczęcie procesu zmiany hasła");
      
      const response = await fetch("/api/auth/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logger.error("Błąd podczas zmiany hasła z API", { 
          status: response.status,
          error: errorData.error 
        });
        return false;
      }
      
      logger.info("Hasło użytkownika zostało zmienione pomyślnie");
      return true;
    } catch (error) {
      logger.error("Nieoczekiwany błąd podczas zmiany hasła", { error });
      return false;
    }
  }

  /**
   * Usuwa konto użytkownika
   * @param password Hasło do weryfikacji
   * @returns Promise rozwiązywany do boolean wskazującego sukces lub porażkę
   */
  static async deleteAccount(password: string): Promise<boolean> {
    try {
      logger.info("Rozpoczęcie procesu usuwania konta");
      
      const response = await fetch("/api/auth/account", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        logger.error("Błąd podczas usuwania konta z API", { 
          status: response.status,
          error: errorData.error 
        });
        return false;
      }
      
      logger.info("Konto użytkownika zostało usunięte pomyślnie");
      return true;
    } catch (error) {
      logger.error("Nieoczekiwany błąd podczas usuwania konta", { error });
      return false;
    }
  }
} 