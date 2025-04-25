import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AuthService } from '../auth.service';
import { logger } from '@/lib/utils/logger';
import { supabaseClient } from '@/db/supabase.client';

// Mock the Supabase client
vi.mock('@/db/supabase.client', () => ({
  supabaseClient: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      signInWithPassword: vi.fn(),
      updateUser: vi.fn(),
      admin: {
        deleteUser: vi.fn()
      }
    }
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
  const mockSession = {
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      created_at: new Date().toISOString()
    }
  };

  beforeEach(() => {
    // Reset all mocks
    vi.resetAllMocks();
    mockFetch.mockReset();

    // Mock the getSession method to return a session by default
    vi.spyOn(AuthService, 'getSession').mockResolvedValue(mockSession as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('changePassword', () => {
    it('should successfully change password when current password is correct', async () => {
      // Arrange
      const currentPassword = 'current-password';
      const newPassword = 'new-password';
      
      // Mock successful signInWithPassword
      vi.mocked(supabaseClient.auth.signInWithPassword).mockResolvedValue({
        data: { session: mockSession },
        error: null
      } as any);
      
      // Mock successful updateUser
      vi.mocked(supabaseClient.auth.updateUser).mockResolvedValue({
        data: { user: mockSession.user },
        error: null
      } as any);
      
      // Act
      const result = await AuthService.changePassword(currentPassword, newPassword);
      
      // Assert
      expect(result).toBe(true);
      expect(supabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: mockSession.user.email,
        password: currentPassword
      });
      expect(supabaseClient.auth.updateUser).toHaveBeenCalledWith({
        password: newPassword
      });
      expect(logger.info).toHaveBeenCalledWith(
        "Hasło użytkownika zostało zmienione",
        { userId: mockSession.user.id }
      );
    });
    
    it('should fail to change password when current password is incorrect', async () => {
      // Arrange
      const currentPassword = 'wrong-password';
      const newPassword = 'new-password';
      
      // Mock failed signInWithPassword
      vi.mocked(supabaseClient.auth.signInWithPassword).mockResolvedValue({
        data: {},
        error: { message: 'Invalid login credentials' }
      } as any);
      
      // Act
      const result = await AuthService.changePassword(currentPassword, newPassword);
      
      // Assert
      expect(result).toBe(false);
      expect(supabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: mockSession.user.email,
        password: currentPassword
      });
      expect(supabaseClient.auth.updateUser).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledWith(
        "Nieprawidłowe aktualne hasło przy próbie zmiany hasła",
        { userId: mockSession.user.id }
      );
    });
    
    it('should fail to change password when no session is available', async () => {
      // Arrange
      const currentPassword = 'current-password';
      const newPassword = 'new-password';
      
      // Mock no session
      vi.spyOn(AuthService, 'getSession').mockResolvedValueOnce(null);
      
      // Act
      const result = await AuthService.changePassword(currentPassword, newPassword);
      
      // Assert
      expect(result).toBe(false);
      expect(supabaseClient.auth.signInWithPassword).not.toHaveBeenCalled();
      expect(supabaseClient.auth.updateUser).not.toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledWith("Próba zmiany hasła bez aktywnej sesji");
    });
    
    it('should handle error when updateUser fails', async () => {
      // Arrange
      const currentPassword = 'current-password';
      const newPassword = 'new-password';
      
      // Mock successful signInWithPassword
      vi.mocked(supabaseClient.auth.signInWithPassword).mockResolvedValue({
        data: { session: mockSession },
        error: null
      } as any);
      
      // Mock failed updateUser
      vi.mocked(supabaseClient.auth.updateUser).mockResolvedValue({
        data: {},
        error: { message: 'Failed to update password' }
      } as any);
      
      // Act
      const result = await AuthService.changePassword(currentPassword, newPassword);
      
      // Assert
      expect(result).toBe(false);
      expect(supabaseClient.auth.signInWithPassword).toHaveBeenCalled();
      expect(supabaseClient.auth.updateUser).toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledWith(
        "Błąd podczas aktualizacji hasła",
        expect.objectContaining({
          userId: mockSession.user.id,
          error: 'Failed to update password'
        })
      );
    });
  });
  
  describe('deleteAccount', () => {
    it('should successfully delete account when password is correct', async () => {
      // Arrange
      const password = 'correct-password';
      
      // Mock successful signInWithPassword
      vi.mocked(supabaseClient.auth.signInWithPassword).mockResolvedValue({
        data: { session: mockSession },
        error: null
      } as any);
      
      // Mock successful API call
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });
      
      // Act
      const result = await AuthService.deleteAccount(password);
      
      // Assert
      expect(result).toBe(true);
      expect(supabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: mockSession.user.email,
        password: password
      });
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/auth/account",
        expect.objectContaining({
          method: "DELETE",
          headers: expect.objectContaining({
            "Content-Type": "application/json"
          })
        })
      );
      expect(logger.info).toHaveBeenCalledWith(
        "Konto użytkownika zostało usunięte",
        { userId: mockSession.user.id }
      );
    });
    
    it('should fail to delete account when password is incorrect', async () => {
      // Arrange
      const password = 'wrong-password';
      
      // Mock failed signInWithPassword
      vi.mocked(supabaseClient.auth.signInWithPassword).mockResolvedValue({
        data: {},
        error: { message: 'Invalid login credentials' }
      } as any);
      
      // Act
      const result = await AuthService.deleteAccount(password);
      
      // Assert
      expect(result).toBe(false);
      expect(supabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: mockSession.user.email,
        password: password
      });
      expect(mockFetch).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledWith(
        "Nieprawidłowe hasło przy próbie usunięcia konta",
        { userId: mockSession.user.id }
      );
    });
    
    it('should fail to delete account when no session is available', async () => {
      // Arrange
      const password = 'correct-password';
      
      // Mock no session
      vi.spyOn(AuthService, 'getSession').mockResolvedValueOnce(null);
      
      // Act
      const result = await AuthService.deleteAccount(password);
      
      // Assert
      expect(result).toBe(false);
      expect(supabaseClient.auth.signInWithPassword).not.toHaveBeenCalled();
      expect(mockFetch).not.toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledWith("Próba usunięcia konta bez aktywnej sesji");
    });
    
    it('should handle error when API call fails', async () => {
      // Arrange
      const password = 'correct-password';
      
      // Mock successful signInWithPassword
      vi.mocked(supabaseClient.auth.signInWithPassword).mockResolvedValue({
        data: { session: mockSession },
        error: null
      } as any);
      
      // Mock failed API call
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Server error' })
      });
      
      // Act
      const result = await AuthService.deleteAccount(password);
      
      // Assert
      expect(result).toBe(false);
      expect(supabaseClient.auth.signInWithPassword).toHaveBeenCalled();
      expect(mockFetch).toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledWith(
        "Błąd podczas usuwania konta przez API",
        expect.objectContaining({
          userId: mockSession.user.id,
          status: 500
        })
      );
    });
  });
}); 