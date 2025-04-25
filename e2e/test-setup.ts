/**
 * Custom setup for Playwright tests
 * 
 * This file helps isolate Playwright's testing environment from Vitest
 * to prevent conflicts between their respective expect implementations.
 */

import { test as baseTest, expect } from '@playwright/test';
import { resolve as _resolve } from 'path';
import { register } from 'tsconfig-paths';

// Register path aliases
register({
  baseUrl: '.',
  paths: {
    '@/*': ['./src/*']
  }
});

// Cookie names from src/db/supabase.client.ts
const _AUTH_COOKIE_NAMES = {
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
const _mockSessionResponse = {
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
export const test = baseTest.extend<TestFixtures>({
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
    
    // Set test mode header for all requests
    await page.setExtraHTTPHeaders({
      'x-test-mode': 'true'
    });
    
    if (isAuthenticated) {
      // Navigate to the app domain first to avoid security errors
      await page.goto('/');
      
      // Create auth-related cookies
      const mockSession = {
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        token_type: 'bearer',
        user: { 
          id: 'test-user-id', 
          email: 'test@example.com',
          aud: 'authenticated',
          role: 'authenticated'
        }
      };
      
      // Set cookies directly rather than using localStorage
      await page.context().addCookies([
        {
          name: 'sb-access-token',
          value: mockSession.access_token,
          domain: 'localhost',
          path: '/',
          httpOnly: false,
          secure: false
        },
        {
          name: 'sb-refresh-token',
          value: mockSession.refresh_token,
          domain: 'localhost',
          path: '/',
          httpOnly: false,
          secure: false
        }
      ]);
      
      // Set up API mocking
      await page.route('**/rest/v1/flashcards**', route => {
        if (route.request().method() === 'GET') {
          return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([
              { 
                id: '1', 
                front: 'Test Front 1', 
                back: 'Test Back 1',
                created_at: new Date().toISOString(),
                user_id: 'test-user-id' 
              },
              { 
                id: '2', 
                front: 'Test Front 2', 
                back: 'Test Back 2',
                created_at: new Date().toISOString(),
                user_id: 'test-user-id' 
              }
            ])
          });
        }
        return route.continue();
      });
      
      await page.route('**/auth/v1/user', route => {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'test-user-id',
            email: 'test@example.com',
            aud: 'authenticated',
            role: 'authenticated'
          })
        });
      });
    }
    await use(page);
  },
});

export { expect };

// Setup function to be called at the beginning of each test file
export function setupTestEnvironment() {
  // No need to do anything here as test-environment.ts handles it
} 