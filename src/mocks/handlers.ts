import { http, HttpResponse } from 'msw';

// Example user data
const users = [
  { id: '1', name: 'John Doe', email: 'john@example.com' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
];

interface Flashcard {
  id: string;
  userId: string;
  front: string;
  back: string;
}

interface NewFlashcard {
  front: string;
  back: string;
}

// Example flashcards
const flashcards: Flashcard[] = [
  { 
    id: '1', 
    userId: '1', 
    front: 'What is TypeScript?', 
    back: 'TypeScript is a statically typed superset of JavaScript that adds optional type checking.'
  },
  { 
    id: '2', 
    userId: '1', 
    front: 'What is React?', 
    back: 'React is a JavaScript library for building user interfaces.'
  },
];

export const handlers = [
  // Get current user
  http.get('/api/user', () => {
    return HttpResponse.json(users[0]);
  }),
  
  // Get flashcards for current user
  http.get('/api/flashcards', () => {
    return HttpResponse.json(flashcards.filter(card => card.userId === '1'));
  }),
  
  // Create a new flashcard
  http.post('/api/flashcards', async ({ request }) => {
    const newCard = await request.json() as NewFlashcard;
    
    // Simulate adding to database
    const flashcard: Flashcard = {
      id: String(flashcards.length + 1),
      userId: '1',
      front: newCard.front,
      back: newCard.back
    };
    
    flashcards.push(flashcard);
    return HttpResponse.json(flashcard, { status: 201 });
  }),
  
  // Error example
  http.get('/api/error', () => {
    return new HttpResponse(null, {
      status: 500,
      statusText: 'Internal Server Error'
    });
  }),
]; 