/**
 * Custom setup for Playwright tests
 * 
 * This file helps isolate Playwright's testing environment from Vitest
 * to prevent conflicts between their respective expect implementations.
 */

import { test as baseTest } from '@playwright/test';
import type { Page } from '@playwright/test';
import { resolve as _resolve } from 'path';
import { register } from 'tsconfig-paths';
import { test as pageTest } from './fixtures/page-objects';

// Register path aliases
register({
  baseUrl: '.',
  paths: {
    '@/*': ['./src/*']
  }
});

// Cookie names
const AUTH_COOKIE_NAMES = {
  accessToken: 'sb-access-token',
  refreshToken: 'sb-refresh-token'
};

// Test user data
const TEST_USER = {
  id: 'test-user-id',
  email: 'test@example.com',
  access_token: 'test-access-token',
  refresh_token: 'test-refresh-token'
};

// Mock session data
const mockSession = {
  access_token: TEST_USER.access_token,
  refresh_token: TEST_USER.refresh_token,
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  user: {
    id: TEST_USER.id,
    email: TEST_USER.email
  }
};

type TestFixtures = {
  isAuthenticated: boolean;
};

// Extend the base test with custom fixtures and page objects
export const test = pageTest.extend<TestFixtures>({
  isAuthenticated: false,
  
  context: async ({ context }, use) => {
    // Set timeouts for all actions
    context.setDefaultTimeout(10000);
    await use(context);
  },

  page: async ({ page, isAuthenticated }, use) => {
    // Set navigation timeouts
    page.setDefaultNavigationTimeout(10000);
    page.setDefaultTimeout(10000);
    
    if (isAuthenticated) {
      // Navigate to the app domain first
      await page.goto('/');
      
      // Set auth cookies
      await page.context().addCookies([
        {
          name: AUTH_COOKIE_NAMES.accessToken,
          value: mockSession.access_token,
          domain: 'localhost',
          path: '/',
          httpOnly: true,
          secure: true,
          sameSite: 'Lax'
        },
        {
          name: AUTH_COOKIE_NAMES.refreshToken,
          value: mockSession.refresh_token,
          domain: 'localhost',
          path: '/',
          httpOnly: true,
          secure: true,
          sameSite: 'Lax'
        }
      ]);

      // Mock auth endpoints
      await page.route('**/api/auth/session', route => {
        route.fulfill({
          status: 200,
          body: JSON.stringify(mockSession)
        });
      });

      await page.route('**/api/users/me', route => {
        route.fulfill({
          status: 200,
          body: JSON.stringify({
            id: TEST_USER.id,
            email: TEST_USER.email,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        });
      });

      // Mock flashcards endpoint
      await page.route('**/api/flashcards', route => {
        if (route.request().method() === 'GET') {
          route.fulfill({
            status: 200,
            body: JSON.stringify([
              {
                id: '1',
                front: 'Test Front 1',
                back: 'Test Back 1',
                created_at: new Date().toISOString(),
                user_id: TEST_USER.id
              },
              {
                id: '2',
                front: 'Test Front 2',
                back: 'Test Back 2',
                created_at: new Date().toISOString(),
                user_id: TEST_USER.id
              }
            ])
          });
        } else {
          route.continue();
        }
      });
    }
    await use(page);
  },
});

// Setup function to be called at the beginning of each test file
export function setupTestEnvironment() {
  // No need to do anything here as test-environment.ts handles it
} 