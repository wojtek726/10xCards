import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { APIContext } from 'astro';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/db/database.types';
import type { AstroCookies } from 'astro';
import { PUT, DELETE } from '../flashcards/[id]';
import { FlashcardService } from '@/lib/services/flashcard.service';
import { createSupabaseServerInstance } from '@/db/supabase.client';

// Mock Supabase
const mockSupabase = {
  auth: {
    getUser: vi.fn().mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null
    })
  }
} as unknown as SupabaseClient<Database>;

vi.mock('@/db/supabase.client', () => ({
  createSupabaseServerInstance: vi.fn(() => mockSupabase)
}));

// Mock FlashcardService
const mockFlashcardService = {
  updateFlashcard: vi.fn(),
  deleteFlashcard: vi.fn()
};

vi.mock('@/lib/services/flashcard.service', () => ({
  FlashcardService: vi.fn(() => mockFlashcardService)
}));

describe('Flashcards API', () => {
  const createMockContext = (request: Request): Partial<APIContext> => {
    const mockCookies = {
      get: () => undefined,
      has: () => false,
      set: () => {},
      delete: () => {},
      headers: function* () { yield ''; },
      merge: () => {}
    } as unknown as AstroCookies;

    return {
      params: { id: '123' },
      props: {},
      request,
      cookies: mockCookies,
      url: new URL('http://localhost'),
      site: new URL('http://localhost'),
      redirect: () => new Response(null, { status: 302 }),
      locals: {
        supabase: mockSupabase
      }
    };
  };

  const mockFlashcard = {
    id: '123',
    front: 'Test front',
    back: 'Test back',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: 'test-user-id',
    card_origin: 'manual'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (mockSupabase.auth.getUser as any).mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
      error: null
    });
  });

  describe('PUT /api/flashcards/:id', () => {
    const mockRequest = new Request('http://localhost', {
      method: 'PUT',
      body: JSON.stringify({
        front: 'Updated front',
        back: 'Updated back'
      })
    });

    it('updates a flashcard', async () => {
      mockFlashcardService.updateFlashcard.mockResolvedValueOnce(mockFlashcard);

      const response = await PUT(createMockContext(mockRequest) as APIContext);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockFlashcard);
      expect(mockFlashcardService.updateFlashcard).toHaveBeenCalledWith(
        '123',
        'test-user-id',
        { front: 'Updated front', back: 'Updated back' }
      );
    });

    it('returns 404 when flashcard is not found', async () => {
      mockFlashcardService.updateFlashcard.mockRejectedValueOnce(new Error('Flashcard not found'));

      const response = await PUT(createMockContext(mockRequest) as APIContext);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: 'Flashcard not found' });
      expect(mockFlashcardService.updateFlashcard).toHaveBeenCalledWith(
        '123',
        'test-user-id',
        { front: 'Updated front', back: 'Updated back' }
      );
    });

    it('handles validation errors', async () => {
      const invalidRequest = new Request('http://localhost', {
        method: 'PUT',
        body: JSON.stringify({
          front: '', // Invalid - empty
          back: 'Back'
        })
      });

      const response = await PUT(createMockContext(invalidRequest) as APIContext);

      expect(response.status).toBe(400);
      expect(mockFlashcardService.updateFlashcard).not.toHaveBeenCalled();
    });

    it('handles unauthorized access', async () => {
      (mockSupabase.auth.getUser as any).mockResolvedValueOnce({
        data: { user: null },
        error: null
      });

      const response = await PUT(createMockContext(mockRequest) as APIContext);

      expect(response.status).toBe(401);
      expect(mockFlashcardService.updateFlashcard).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /api/flashcards/:id', () => {
    const mockRequest = new Request('http://localhost', {
      method: 'DELETE'
    });

    it('deletes a flashcard', async () => {
      mockFlashcardService.deleteFlashcard.mockResolvedValueOnce(true);

      const response = await DELETE(createMockContext(mockRequest) as APIContext);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({ success: true });
      expect(mockFlashcardService.deleteFlashcard).toHaveBeenCalledWith('123', 'test-user-id');
    });

    it('returns 404 when flashcard is not found', async () => {
      mockFlashcardService.deleteFlashcard.mockResolvedValueOnce(false);

      const response = await DELETE(createMockContext(mockRequest) as APIContext);

      expect(response.status).toBe(404);
      expect(mockFlashcardService.deleteFlashcard).toHaveBeenCalledWith('123', 'test-user-id');
    });

    it('handles unauthorized access', async () => {
      (mockSupabase.auth.getUser as any).mockResolvedValueOnce({
        data: { user: null },
        error: null
      });

      const response = await DELETE(createMockContext(mockRequest) as APIContext);

      expect(response.status).toBe(401);
      expect(mockFlashcardService.deleteFlashcard).not.toHaveBeenCalled();
    });
  });
}); 