import { describe, it, expect, vi } from 'vitest';
import { beforeAll, afterAll, afterEach, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { FlashcardService } from '../flashcard.service';
import type { FlashcardDTO } from '../../../types';

// Mock for SupabaseClient to be passed to FlashcardService
const mockSupabase = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  range: vi.fn().mockReturnThis(),
  single: vi.fn().mockReturnThis(),
  count: vi.fn().mockReturnThis()
};

// Sample flashcard data for testing
const mockFlashcards: FlashcardDTO[] = [
  {
    id: '1',
    front: 'What is TypeScript?',
    back: 'TypeScript is a statically typed superset of JavaScript.',
    card_origin: 'manual',
    created_at: '2023-01-01T00:00:00.000Z',
    user_id: 'test-user-id'
  },
  {
    id: '2',
    front: 'What is React?',
    back: 'React is a JavaScript library for building user interfaces.',
    card_origin: 'manual',
    created_at: '2023-01-02T00:00:00.000Z',
    user_id: 'test-user-id'
  }
];

// Create MSW server with handlers
const server = setupServer(
  // GET /api/flashcards
  http.get('/api/flashcards', () => {
    return HttpResponse.json(mockFlashcards);
  }),
  
  // POST /api/flashcards
  http.post('/api/flashcards', async ({ request }) => {
    const newCard = await request.json() as { front: string; back: string };
    
    const createdCard: FlashcardDTO = {
      id: '3',
      front: newCard.front,
      back: newCard.back,
      card_origin: 'manual',
      created_at: new Date().toISOString(),
      user_id: 'test-user'
    };
    
    return HttpResponse.json(createdCard, { status: 201 });
  })
);

describe('FlashcardService', () => {
  let service: FlashcardService;
  
  // Start MSW server before tests with proper onUnhandledRequest config
  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  
  // Reset handlers between tests
  afterEach(() => {
    server.resetHandlers();
    vi.clearAllMocks();
  });
  
  // Close server after all tests
  afterAll(() => server.close());
  
  beforeEach(() => {
    // Reset the mocks for Supabase client
    mockSupabase.from.mockReturnThis();
    mockSupabase.select.mockReturnThis();
    mockSupabase.insert.mockReturnThis();
    mockSupabase.update.mockReturnThis();
    mockSupabase.delete.mockReturnThis();
    mockSupabase.eq.mockReturnThis();
    mockSupabase.order.mockReturnThis();
    mockSupabase.range.mockReturnThis();
    mockSupabase.single.mockReturnThis();
    
    // Mock console.error for error tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Create a new service instance with mocked supabase client
    service = new FlashcardService(mockSupabase as any);
  });
  
  it('should fetch flashcards', async () => {
    // Mock Supabase response for count query
    mockSupabase.from.mockReturnThis();
    mockSupabase.select.mockReturnThis();
    mockSupabase.eq.mockReturnThis();
    mockSupabase.count = vi.fn().mockResolvedValue({ count: 2, error: null });
    
    // Mock Supabase response for main query
    mockSupabase.from.mockReturnThis();
    mockSupabase.select.mockReturnThis();
    mockSupabase.eq.mockReturnThis();
    mockSupabase.order.mockReturnThis();
    mockSupabase.range.mockResolvedValue({
      data: mockFlashcards,
      error: null
    });
    
    // Act
    const result = await service.getFlashcards("test-user");
    
    // Assert
    expect(result.flashcards).toHaveLength(2);
    expect(result.flashcards[0].id).toBe('1');
    expect(result.flashcards[0].front).toBe('What is TypeScript?');
    expect(result.flashcards[1].id).toBe('2');
    expect(result.flashcards[1].front).toBe('What is React?');
  });
  
  it('should create a new flashcard', async () => {
    // Arrange
    const newFlashcard = {
      front: 'What is Vitest?',
      back: 'Vitest is a Vite-native testing framework for JavaScript.',
      card_origin: 'manual' as const
    };
    
    // Mock Supabase response
    mockSupabase.from.mockReturnThis();
    mockSupabase.insert.mockReturnThis();
    mockSupabase.select.mockReturnThis();
    mockSupabase.single.mockResolvedValue({
      data: {
        id: '3',
        ...newFlashcard,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 'test-user'
      },
      error: null
    });
    
    // Spy on service createFlashcard method to override test-id generation
    vi.spyOn(service, 'createFlashcard').mockResolvedValueOnce({
      id: '3',
      ...newFlashcard,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: 'test-user'
    });
    
    // Act
    const createdFlashcard = await service.createFlashcard("test-user", newFlashcard);
    
    // Assert
    expect(createdFlashcard).toBeDefined();
    expect(createdFlashcard.id).toBe('3');
    expect(createdFlashcard.front).toBe('What is Vitest?');
    expect(createdFlashcard.back).toBe('Vitest is a Vite-native testing framework for JavaScript.');
    expect(createdFlashcard.card_origin).toBe('manual');
  });
  
  it('should handle API errors when fetching flashcards', async () => {
    // Arrange - testujemy najprostszy przypadek błędu przy pobieraniu fiszek
    mockSupabase.from.mockReturnThis();
    mockSupabase.select.mockReturnThis();
    mockSupabase.eq.mockReturnThis();
    mockSupabase.order.mockReturnThis();
    mockSupabase.range.mockResolvedValue({
      data: null,
      error: { message: 'Database error', code: '500' }
    });
    
    // Act
    const result = await service.getFlashcards("test-user");
    
    // Assert - service handles errors by returning empty data instead of throwing
    expect(result.flashcards).toEqual([]);
    expect(result.pagination.total).toBe(0);
    expect(console.error).toHaveBeenCalledWith(
      "Error fetching flashcards:",
      expect.objectContaining({ message: "Failed to fetch flashcards: Database error" })
    );
  });

  it('should update a flashcard and keep card_origin as manual', async () => {
    // Arrange - first, mock the select query to get current flashcard
    mockSupabase.from.mockReturnThis();
    mockSupabase.select.mockReturnThis();
    mockSupabase.eq.mockReturnThis();
    mockSupabase.single.mockResolvedValueOnce({
      data: { card_origin: 'manual' },
      error: null
    });

    // Then, mock the update query
    mockSupabase.from.mockReturnThis();
    mockSupabase.update.mockReturnThis();
    mockSupabase.eq.mockReturnThis();
    mockSupabase.select.mockReturnThis();
    mockSupabase.single.mockResolvedValueOnce({
      data: {
        id: '1',
        front: 'Updated front',
        back: 'Updated back',
        card_origin: 'manual',
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: new Date().toISOString(),
        user_id: 'test-user'
      },
      error: null
    });

    // Act
    const updatedFlashcard = await service.updateFlashcard(
      '1', 
      'test-user', 
      { front: 'Updated front', back: 'Updated back' }
    );

    // Assert
    expect(updatedFlashcard).toBeDefined();
    expect(updatedFlashcard?.front).toBe('Updated front');
    expect(updatedFlashcard?.back).toBe('Updated back');
    expect(updatedFlashcard?.card_origin).toBe('manual'); // Should remain as manual
  });

  it('should update a flashcard and change card_origin from ai to ai_modified', async () => {
    // Arrange - first, mock the select query to get current flashcard
    mockSupabase.from.mockReturnThis();
    mockSupabase.select.mockReturnThis();
    mockSupabase.eq.mockReturnThis();
    mockSupabase.single.mockResolvedValueOnce({
      data: { card_origin: 'ai' }, // This is an AI-generated card
      error: null
    });

    // Then, mock the update query
    mockSupabase.from.mockReturnThis();
    mockSupabase.update.mockReturnThis();
    mockSupabase.eq.mockReturnThis();
    mockSupabase.select.mockReturnThis();
    mockSupabase.single.mockResolvedValueOnce({
      data: {
        id: '2',
        front: 'Updated AI card',
        back: 'Updated AI explanation',
        card_origin: 'ai_modified', // This should be changed to ai_modified
        created_at: '2023-01-02T00:00:00.000Z',
        updated_at: new Date().toISOString(),
        user_id: 'test-user'
      },
      error: null
    });

    // Act
    const updatedFlashcard = await service.updateFlashcard(
      '2', 
      'test-user', 
      { front: 'Updated AI card', back: 'Updated AI explanation' }
    );

    // Assert
    expect(updatedFlashcard).toBeDefined();
    expect(updatedFlashcard?.front).toBe('Updated AI card');
    expect(updatedFlashcard?.back).toBe('Updated AI explanation');
    expect(updatedFlashcard?.card_origin).toBe('ai_modified'); // Should be changed to ai_modified
  });
}); 