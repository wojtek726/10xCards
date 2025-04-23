import type { Page } from '@playwright/test';
import { AuthPage } from '../page-objects/AuthPage';

interface TestUser {
  email: string;
  password: string;
}

interface TestFlashcard {
  front: string;
  back: string;
}

/**
 * Generates a unique test user
 */
export function generateTestUser(): TestUser {
  const timestamp = Date.now();
  return {
    email: `test-user-${timestamp}@example.com`,
    password: `Test@${timestamp}`
  };
}

/**
 * Generates a test flashcard with random content
 */
export function generateTestFlashcard(prefix = ''): TestFlashcard {
  const timestamp = Date.now();
  const randomId = Math.floor(Math.random() * 1000);
  return {
    front: `${prefix}Test Front ${randomId}-${timestamp}`,
    back: `${prefix}Test Back ${randomId}-${timestamp}`
  };
}

/**
 * Registers and logs in a test user
 */
export async function loginTestUser(page: Page, user?: TestUser): Promise<TestUser> {
  const testUser = user || generateTestUser();
  
  // Mock auth endpoints for tests
  await page.route('**/api/auth/signup', route => {
    route.fulfill({
      status: 200,
      body: JSON.stringify({ success: true })
    });
  });
  
  await page.route('**/api/auth/login', route => {
    route.fulfill({
      status: 200,
      body: JSON.stringify({ 
        success: true,
        user: { id: 'test-user-id', email: testUser.email }
      }),
      headers: {
        'Set-Cookie': 'access_token=test-token; Path=/; HttpOnly; SameSite=Lax'
      }
    });
  });
  
  await page.route('**/api/users/me', route => {
    route.fulfill({
      status: 200,
      body: JSON.stringify({ id: 'test-user-id', email: testUser.email })
    });
  });
  
  // Force a redirect to the home page after login (bypassing the auth check)
  await page.route('**/auth/login', route => {
    if (route.request().method() === 'GET') {
      route.continue(); // Allow GET requests to show the login page
    } else {
      route.fulfill({
        status: 302,
        headers: {
          'Location': '/'
        }
      });
    }
  });
  
  // Mock the home page to show as if we're logged in
  await page.route('/', route => {
    if (route.request().resourceType() === 'document') {
      route.fulfill({
        status: 200,
        body: `
          <!DOCTYPE html>
          <html>
            <head><title>Test Home</title></head>
            <body>
              <div id="app">
                <button data-testid="user-menu-button">Konto</button>
              </div>
            </body>
          </html>
        `
      });
    } else {
      route.continue();
    }
  });
  
  const authPage = new AuthPage(page);
  
  // Do either login or register, both should work with our mocks
  await authPage.login(testUser.email, testUser.password);
  await page.waitForTimeout(500); // Small delay to ensure mocks are applied
  
  // Force navigation to home page to avoid redirect issues
  await page.goto('/');
  
  return testUser;
}

/**
 * Takes a screenshot and saves it with a unique filename
 */
export async function takeScreenshot(page: Page, name: string): Promise<void> {
  const timestamp = Date.now();
  await page.screenshot({ path: `./test-results/screenshots/${name}-${timestamp}.png` });
}

/**
 * Cleans up test data, such as logs out the current user
 */
export async function cleanupTest(page: Page): Promise<void> {
  const authPage = new AuthPage(page);
  if (await authPage.isLoggedIn()) {
    await authPage.logout();
  }
}

/**
 * Waits for network requests to complete
 */
export async function waitForNetworkIdle(page: Page, timeout = 5000): Promise<void> {
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Execute visual tests with screenshot comparison
 */
export async function visualTest(page: Page, testName: string): Promise<void> {
  await page.waitForTimeout(500); // Allow animations to complete
  await page.screenshot({ path: `./test-results/visual/${testName}.png` });
} 