import { test as base, expect } from '@playwright/test';

// Cookie names from src/db/supabase.client.ts
const AUTH_COOKIE_NAMES = {
  accessToken: 'sb-access-token',
  refreshToken: 'sb-refresh-token',
  authCookie: 'supabase-auth-token'
};

// Test user data
const TEST_USER = {
  id: 'test-user-id',
  email: 'test@example.com',
  access_token: 'test-access-token',
  refresh_token: 'test-refresh-token'
};

// Add explicit mock for API call to get user
const mockUserApiResponse = {
  id: TEST_USER.id,
  email: TEST_USER.email,
  aud: 'authenticated',
  role: 'authenticated',
  app_metadata: { provider: 'email' },
  user_metadata: {},
  created_at: new Date().toISOString()
};

// Mock for session response
const mockSessionResponse = {
  access_token: TEST_USER.access_token,
  refresh_token: TEST_USER.refresh_token,
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: 'bearer',
  user: mockUserApiResponse
};

type TestFixtures = {
  isAuthenticated: boolean;
};

// Extend the base test with custom fixtures
export const test = base.extend<TestFixtures>({
  isAuthenticated: [false, { option: true }],
  
  context: async ({ context }, use) => {
    // Set longer timeouts for all actions
    context.setDefaultTimeout(60000); // 60 seconds timeout for all actions
    
    // Grant specific permissions (clipboard access seems reasonable for tests)
    // If localStorage access is needed, consider saving/loading storage state instead.
    await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: 'http://localhost:3000' });
    await use(context);
  },

  page: async ({ page, isAuthenticated }, use) => {
    // Set longer navigation timeouts
    page.setDefaultNavigationTimeout(60000);
    
    if (isAuthenticated) {
      // Logowanie poprzez dodanie ciasteczek i localStorage
      await page.goto('/');
      
      await page.evaluate(() => {
        // Dodaj dane autoryzacyjne do localStorage
        localStorage.setItem('sb-access-token', 'test-access-token');
        localStorage.setItem('sb-refresh-token', 'test-refresh-token');
        localStorage.setItem('supabase-auth-token', JSON.stringify({
          access_token: 'test-access-token',
          refresh_token: 'test-refresh-token'
        }));
        
        // Dodaj ciasteczka
        document.cookie = 'sb-access-token=test-access-token; path=/';
        document.cookie = 'sb-refresh-token=test-refresh-token; path=/';
        
        // Dodaj dane użytkownika
        localStorage.setItem('user', JSON.stringify({
          id: 'test-user-id',
          email: 'test@example.com'
        }));
        
        console.log('Test setup: authentication data added');
      });
      
      // Mock API odpowiedzi na zapytania o sesję i użytkownika
      await page.route('**/api/auth/session', route => {
        route.fulfill({
          status: 200,
          body: JSON.stringify({
            user: { 
              id: 'test-user-id', 
              email: 'test@example.com' 
            },
            session: {
              access_token: 'test-access-token',
              refresh_token: 'test-refresh-token',
              expires_in: 3600
            }
          })
        });
      });
      
      await page.route('**/api/users/me', route => {
        route.fulfill({
          status: 200,
          body: JSON.stringify({
            id: 'test-user-id',
            email: 'test@example.com'
          })
        });
      });
      
      // Dodajemy też mockowanie endpointów flashcards
      await page.route('**/api/flashcards', route => {
        if (route.request().method() === 'GET') {
          route.fulfill({
            status: 200,
            body: JSON.stringify({ flashcards: [] })
          });
        } else {
          route.continue();
        }
      });
    }
    await use(page);
  },
});

export { expect }; 