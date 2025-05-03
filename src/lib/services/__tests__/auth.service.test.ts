import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthService } from '../auth.service';
import { logger } from '@/lib/utils/logger';

// Mock the supabase client module
vi.mock('@/db/supabase.client', () => ({
  createServerClient: vi.fn(),
  cookieOptions: {
    path: "/",
    secure: false,
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7
  }
}));

// Mock the logger
vi.mock('@/lib/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}));

// Mock the fetch API
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('AuthService', () => {
  beforeEach(() => {
    // Reset all mocks
    vi.resetAllMocks();
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('changePassword', () => {
    it('should successfully change password when current password is correct', async () => {
      // Arrange
      const currentPassword = 'current-password';
      const newPassword = 'new-password';
      
      // Mock successful API call
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });
      
      // Act
      const result = await AuthService.changePassword(currentPassword, newPassword);
      
      // Assert
      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/auth/password",
        expect.objectContaining({
          method: "PUT",
          headers: expect.objectContaining({
            "Content-Type": "application/json"
          }),
          body: JSON.stringify({
            currentPassword,
            newPassword
          })
        })
      );
      expect(logger.info).toHaveBeenCalledWith("Hasło użytkownika zostało zmienione pomyślnie");
    });
    
    it('should fail to change password when API returns error', async () => {
      // Arrange
      const currentPassword = 'wrong-password';
      const newPassword = 'new-password';
      
      // Mock failed API call
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: 'Invalid current password' })
      });
      
      // Act
      const result = await AuthService.changePassword(currentPassword, newPassword);
      
      // Assert
      expect(result).toBe(false);
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/auth/password",
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify({
            currentPassword,
            newPassword
          })
        })
      );
      expect(logger.error).toHaveBeenCalledWith(
        "Błąd podczas zmiany hasła z API",
        expect.objectContaining({
          status: 401,
          error: 'Invalid current password'
        })
      );
    });
    
    it('should handle unexpected errors during password change', async () => {
      // Arrange
      const currentPassword = 'current-password';
      const newPassword = 'new-password';
      
      // Mock fetch throwing error
      mockFetch.mockRejectedValue(new Error('Network error'));
      
      // Act
      const result = await AuthService.changePassword(currentPassword, newPassword);
      
      // Assert
      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalledWith(
        "Nieoczekiwany błąd podczas zmiany hasła",
        expect.objectContaining({
          error: expect.any(Error)
        })
      );
    });
  });
  
  describe('deleteAccount', () => {
    it('should successfully delete account when password is correct', async () => {
      // Arrange
      const password = 'correct-password';
      
      // Mock successful API call
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });
      
      // Act
      const result = await AuthService.deleteAccount(password);
      
      // Assert
      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/auth/account",
        expect.objectContaining({
          method: "DELETE",
          headers: expect.objectContaining({
            "Content-Type": "application/json"
          }),
          body: JSON.stringify({ password })
        })
      );
      expect(logger.info).toHaveBeenCalledWith("Konto użytkownika zostało usunięte pomyślnie");
    });
    
    it('should fail to delete account when API returns error', async () => {
      // Arrange
      const password = 'wrong-password';
      
      // Mock failed API call
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: 'Invalid password' })
      });
      
      // Act
      const result = await AuthService.deleteAccount(password);
      
      // Assert
      expect(result).toBe(false);
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/auth/account",
        expect.objectContaining({
          method: "DELETE",
          body: JSON.stringify({ password })
        })
      );
      expect(logger.error).toHaveBeenCalledWith(
        "Błąd podczas usuwania konta z API",
        expect.objectContaining({
          status: 401,
          error: 'Invalid password'
        })
      );
    });
    
    it('should handle unexpected errors during account deletion', async () => {
      // Arrange
      const password = 'correct-password';
      
      // Mock fetch throwing error
      mockFetch.mockRejectedValue(new Error('Network error'));
      
      // Act
      const result = await AuthService.deleteAccount(password);
      
      // Assert
      expect(result).toBe(false);
      expect(logger.error).toHaveBeenCalledWith(
        "Nieoczekiwany błąd podczas usuwania konta",
        expect.objectContaining({
          error: expect.any(Error)
        })
      );
    });
  });
}); 