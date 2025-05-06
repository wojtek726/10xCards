import type { Page } from '@playwright/test';
import { TEST_USER } from './auth.mock';

// Mock flashcard data
let MOCK_FLASHCARDS = [
  {
    id: 'test-1',
    front: 'Test Front 1',
    back: 'Test Back 1',
    card_origin: 'manual',
    created_at: '2025-05-06T11:59:57.595Z',
    updated_at: '2025-05-06T11:59:57.595Z',
    user_id: TEST_USER.id
  },
  {
    id: 'test-2',
    front: 'Test Front 2',
    back: 'Test Back 2',
    card_origin: 'ai',
    created_at: '2025-05-06T11:59:57.595Z',
    updated_at: '2025-05-06T11:59:57.595Z',
    user_id: TEST_USER.id
  }
];

export const setupFlashcardMocks = async (page: Page) => {
  // Helper function to create a new flashcard
  const createNewFlashcard = (requestBody: any) => {
    const newFlashcard = {
      id: `test-${Date.now()}`,
      front: requestBody.front,
      back: requestBody.back,
      card_origin: requestBody.card_origin || 'manual',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: TEST_USER.id
    };
    console.log('Created new flashcard:', newFlashcard);
    // Add the new flashcard to the list
    MOCK_FLASHCARDS = [newFlashcard, ...MOCK_FLASHCARDS];
    return newFlashcard;
  };

  // Mock Supabase REST API endpoint
  await page.route('**/rest/v1/flashcards*', async (route) => {
    const request = route.request();
    const method = request.method();
    console.log('Handling /rest/v1/flashcards request:', { method, url: request.url() });

    if (method === 'GET') {
      if (request.url().includes('select=count')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([{ count: MOCK_FLASHCARDS.length }])
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_FLASHCARDS)
        });
      }
    } else if (method === 'POST') {
      const postData = await request.postData();
      const requestBody = postData ? JSON.parse(postData) : {};
      console.log('POST /rest/v1/flashcards request body:', requestBody);
      
      const newFlashcard = createNewFlashcard(requestBody);
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(newFlashcard)
      });
    } else if (method === 'DELETE') {
      const url = request.url();
      const id = url.split('/').pop();
      // Remove the flashcard from the list
      MOCK_FLASHCARDS = MOCK_FLASHCARDS.filter(card => card.id !== id);
      await route.fulfill({
        status: 204
      });
    }
  });

  // Mock API endpoint for backwards compatibility
  await page.route('**/api/flashcards', async (route) => {
    const request = route.request();
    const method = request.method();
    const url = request.url();
    console.log('Handling /api/flashcards request:', { method, url });

    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_FLASHCARDS)
      });
    } else if (method === 'POST') {
      const postData = await request.postData();
      const requestBody = postData ? JSON.parse(postData) : {};
      console.log('POST /api/flashcards request body:', requestBody);
      
      const newFlashcard = createNewFlashcard(requestBody);
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(newFlashcard)
      });
    } else if (method === 'DELETE') {
      // Jeśli brak ID w URL, to nie usuwamy nic konkretnego
      console.log('DELETE /api/flashcards - no ID specified, status 204');
      await route.fulfill({
        status: 204,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    } else {
      // Nieobsługiwana metoda
      console.error(`Unhandled method for /api/flashcards: ${method}`);
      await route.fulfill({ 
        status: 405, 
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Method not allowed' })
      });
    }
  });

  // Mock single flashcard operations
  await page.route('**/api/flashcards/*', async (route) => {
    const request = route.request();
    const method = request.method();
    const url = request.url();
    const paths = url.split('/');
    const id = paths[paths.length - 1]; // Pobierz ostatni element ścieżki jako ID
    
    console.log('Handling /api/flashcards/* request:', { 
      method, 
      url, 
      id,
      headers: request.headers(),
      postData: method === 'PUT' || method === 'POST' ? await request.postData() : null
    });

    if (method === 'GET') {
      const flashcard = MOCK_FLASHCARDS.find(card => card.id === id);
      if (!flashcard) {
        console.log(`Flashcard with ID ${id} not found, returning first flashcard as fallback`);
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_FLASHCARDS[0] || { error: 'No flashcards available' })
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(flashcard)
        });
      }
    } else if (method === 'PUT' || method === 'PATCH') {
      const postData = await request.postData();
      const requestBody = postData ? JSON.parse(postData) : {};
      console.log(`${method} /api/flashcards/${id} request body:`, requestBody);
      
      const existingFlashcardIndex = MOCK_FLASHCARDS.findIndex(card => card.id === id);
      
      if (existingFlashcardIndex === -1) {
        console.log('Flashcard not found:', { id, existingCards: MOCK_FLASHCARDS });
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Flashcard not found' })
        });
        return;
      }

      const existingFlashcard = MOCK_FLASHCARDS[existingFlashcardIndex];
      const updatedFlashcard = {
        ...existingFlashcard,
        ...requestBody,
        updated_at: new Date().toISOString()
      };
      
      console.log('Updating flashcard:', { 
        id, 
        existingFlashcard, 
        requestBody, 
        updatedFlashcard 
      });

      // Update the flashcard in the list
      MOCK_FLASHCARDS[existingFlashcardIndex] = updatedFlashcard;

      // Dodajemy opóźnienie, aby zasymulować wolniejszą odpowiedź serwera
      await new Promise(resolve => setTimeout(resolve, 200));

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(updatedFlashcard)
      });
    } else if (method === 'DELETE') {
      console.log(`DELETE /api/flashcards/${id}`);
      
      // Find the flashcard index
      const existingFlashcardIndex = MOCK_FLASHCARDS.findIndex(card => card.id === id);
      
      if (existingFlashcardIndex === -1) {
        console.log(`Flashcard with ID ${id} not found for deletion`);
        // Still return success for idempotency
        await route.fulfill({
          status: 204
        });
        return;
      }
      
      // Remove the flashcard from the list
      MOCK_FLASHCARDS.splice(existingFlashcardIndex, 1);
      
      // Dodajemy opóźnienie, aby zasymulować wolniejszą odpowiedź serwera
      await new Promise(resolve => setTimeout(resolve, 200));
      
      await route.fulfill({
        status: 204
      });
    } else {
      // Nieobsługiwana metoda
      console.error(`Unhandled method for /api/flashcards/*: ${method}`);
      await route.fulfill({ 
        status: 405, 
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Method not allowed' })
      });
    }
  });
  
  // Dodajemy obsługę nowej ścieżki, która może być używana przez API
  await page.route('**/rest/v1/flashcards*', async (route) => {
    const request = route.request();
    const method = request.method();
    const url = request.url();
    console.log('Handling /rest/v1/flashcards request:', { method, url });

    // Sprawdzamy, czy URL zawiera ID fiszki
    const matchId = url.match(/\/flashcards\?id=eq\.([^&]+)/);
    const id = matchId ? matchId[1] : null;

    if (method === 'GET') {
      if (id) {
        // Specific flashcard request
        const flashcard = MOCK_FLASHCARDS.find(card => card.id === id);
        if (!flashcard) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: '[]' // Pusta tablica, gdy nie ma dopasowania
          });
        } else {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([flashcard])
          });
        }
      } else if (request.url().includes('select=count')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([{ count: MOCK_FLASHCARDS.length }])
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_FLASHCARDS)
        });
      }
    } else if (method === 'POST') {
      const postData = await request.postData();
      const requestBody = postData ? JSON.parse(postData) : {};
      console.log('POST /rest/v1/flashcards request body:', requestBody);
      
      const newFlashcard = createNewFlashcard(requestBody);
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(newFlashcard)
      });
    } else if (method === 'PATCH' && id) {
      const postData = await request.postData();
      const requestBody = postData ? JSON.parse(postData) : {};
      console.log(`PATCH /rest/v1/flashcards id=${id} request body:`, requestBody);
      
      const existingFlashcardIndex = MOCK_FLASHCARDS.findIndex(card => card.id === id);
      
      if (existingFlashcardIndex === -1) {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Not found' })
        });
        return;
      }

      const existingFlashcard = MOCK_FLASHCARDS[existingFlashcardIndex];
      const updatedFlashcard = {
        ...existingFlashcard,
        ...requestBody,
        updated_at: new Date().toISOString()
      };
      
      // Update the flashcard in the list
      MOCK_FLASHCARDS[existingFlashcardIndex] = updatedFlashcard;

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(updatedFlashcard)
      });
    } else if (method === 'DELETE' && id) {
      console.log(`DELETE /rest/v1/flashcards id=${id}`);
      
      // Remove the flashcard from the list
      MOCK_FLASHCARDS = MOCK_FLASHCARDS.filter(card => card.id !== id);
      
      await route.fulfill({
        status: 204
      });
    } else {
      console.error(`Unhandled method for /rest/v1/flashcards: ${method}`);
      await route.fulfill({ 
        status: 405, 
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Method not allowed' })
      });
    }
  });
}; 