import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { FlashcardService } from '../flashcard.service';
import type { FlashcardDTO } from '../../../types';

// Sample flashcard data for testing
const mockFlashcards: FlashcardDTO[] = [
  {
    id: '1',
    front: 'What is TypeScript?',
    back: 'TypeScript is a statically typed superset of JavaScript.',
    card_origin: 'manual',
    created_at: '2023-01-01T00:00:00.000Z'
  },
  {
    id: '2',
    front: 'What is React?',
    back: 'React is a JavaScript library for building user interfaces.',
    card_origin: 'manual',
    created_at: '2023-01-02T00:00:00.000Z'
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
      created_at: new Date().toISOString()
    };
    
    return HttpResponse.json(createdCard, { status: 201 });
  })
);

describe('FlashcardService', () => {
  let service: FlashcardService;
  
  // Start MSW server before tests with proper onUnhandledRequest config
  beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
  
  // Reset handlers between tests
  afterEach(() => server.resetHandlers());
  
  // Close server after all tests
  afterAll(() => server.close());
  
  beforeEach(() => {
    // Create a new service instance for each test
    service = new FlashcardService();
  });
  
  it('should fetch flashcards', async () => {
    // Act
    const flashcards = await service.getFlashcards();
    
    // Assert
    expect(flashcards).toHaveLength(2);
    expect(flashcards[0].id).toBe('1');
    expect(flashcards[0].front).toBe('What is TypeScript?');
    expect(flashcards[1].id).toBe('2');
    expect(flashcards[1].front).toBe('What is React?');
  });
  
  it('should create a new flashcard', async () => {
    // Arrange
    const newFlashcard = {
      front: 'What is Vitest?',
      back: 'Vitest is a Vite-native testing framework for JavaScript.'
    };
    
    // Act
    const createdFlashcard = await service.createFlashcard(newFlashcard);
    
    // Assert
    expect(createdFlashcard).toBeDefined();
    expect(createdFlashcard.id).toBe('3');
    expect(createdFlashcard.front).toBe('What is Vitest?');
    expect(createdFlashcard.back).toBe('Vitest is a Vite-native testing framework for JavaScript.');
    expect(createdFlashcard.card_origin).toBe('manual');
  });
  
  it('should handle API errors when fetching flashcards', async () => {
    // Arrange - Override the handler to return an error
    server.use(
      http.get('/api/flashcards', () => {
        return new HttpResponse(null, { 
          status: 500,
          statusText: 'Internal Server Error'
        });
      })
    );
    
    // Act & Assert
    await expect(service.getFlashcards()).rejects.toThrow('Failed to fetch flashcards: 500 Internal Server Error');
  });
}); 