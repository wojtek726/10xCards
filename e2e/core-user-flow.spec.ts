import { test } from './fixtures/page-objects';
import { expect } from '@playwright/test';
import { TEST_TAGS, TEST_CONFIG } from './test.config';

test.describe('Core User Flow', () => {
  const testUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'Test@123456'
  };

  const testFlashcard = {
    front: 'What is the capital of France?',
    back: 'Paris'
  };

  test.beforeEach(async ({ page }) => {
    // Bezpieczne czyszczenie storage i cookies
    try {
      await page.context().clearCookies();
      
      // Próbujemy wyczyścić storage tylko jeśli jesteśmy na właściwej domenie
      await page.goto('http://localhost:4321');
      await page.waitForLoadState('domcontentloaded');
      
      await page.evaluate(() => {
        try {
          window.localStorage.clear();
          window.sessionStorage.clear();
        } catch (e) {
          console.warn('Could not clear storage:', e);
        }
      });
    } catch (error) {
      console.warn('Error in test setup:', error);
    }
  });

  test(`${TEST_TAGS.CRITICAL} complete user journey`, async ({ page, loginPage, flashcardManagementPage }) => {
    test.setTimeout(60000); // Zwiększamy timeout dla całego testu

    try {
      // 1. Login
      console.log('🔵 Step 1: Logging in...');
      await test.step('Login', async () => {
        // Navigate to login page
        await loginPage.goto();
        await page.waitForLoadState('networkidle');
        
        // Take screenshot before login
        await page.screenshot({ 
          path: 'test-results/1-before-login.png',
          fullPage: true 
        });
        
        // Verify login form is visible
        await expect(page.getByTestId('login-form')).toBeVisible({
          timeout: TEST_CONFIG.TIMEOUTS.ELEMENT
        });
        
        // Attempt login
        await loginPage.login(testUser.email, testUser.password);
        
        // Verify success message
        await loginPage.expectSuccessMessage('Login successful');
        
        // Take screenshot after successful login
        await page.screenshot({ 
          path: 'test-results/1-after-login.png',
          fullPage: true 
        });
      });

      // 2. Verify authentication state
      console.log('🔵 Step 2: Verifying authentication...');
      await test.step('Verify authentication', async () => {
        // Verify URL
        expect(page.url()).toContain('/flashcards');
        
        // Wait for page to be fully loaded
        await page.waitForLoadState('networkidle');
        await page.waitForLoadState('domcontentloaded');
        
        // Log current page state
        console.log('Current URL:', page.url());
        console.log('Checking authentication state...');
        
        // Try to find user menu with increased timeout and retries
        let retries = 3;
        while (retries > 0) {
          try {
            // First check if we're still on the correct page
            if (!page.url().includes('/flashcards')) {
              throw new Error('Not on flashcards page anymore');
            }
            
            // Check for user menu
            const userMenu = await page.waitForSelector('[data-testid="user-menu"]', {
              state: 'visible',
              timeout: 5000
            });
            
            if (!userMenu) {
              throw new Error('User menu not found');
            }
            
            // Check for flashcards list
            const flashcardsList = await page.waitForSelector('[data-testid="flashcards-list"]', {
              state: 'visible',
              timeout: 5000
            });
            
            if (!flashcardsList) {
              throw new Error('Flashcards list not found');
            }
            
            console.log('Authentication verified successfully');
            break;
          } catch (error) {
            retries--;
            if (retries === 0) {
              console.error('Failed to verify authentication state:', error);
              // Take screenshot of failed state
              await page.screenshot({ 
                path: 'test-results/auth-verification-failed.png',
                fullPage: true 
              });
              throw error;
            }
            console.log(`Retry ${3 - retries} - waiting for UI elements...`);
            await page.waitForTimeout(1000);
            await page.reload();
            await page.waitForLoadState('networkidle');
          }
        }
        
        await page.screenshot({ 
          path: 'test-results/2-auth-verified.png',
          fullPage: true 
        });
      });

      // 3. Create flashcard
      console.log('🔵 Step 3: Creating flashcard...');
      await test.step('Create flashcard', async () => {
        // Wait for the flashcards page to be fully loaded
        await flashcardManagementPage.waitForFlashcardsList();
        
        // Create new flashcard
        await flashcardManagementPage.createNewFlashcard(testFlashcard.front, testFlashcard.back);
        
        // Wait for the creation to complete and verify
        await page.waitForResponse(
          response => response.url().includes('/api/flashcards') && response.status() === 200,
          { timeout: TEST_CONFIG.TIMEOUTS.ACTION }
        );
        
        await page.screenshot({ path: 'test-results/3-flashcard-created.png' });
      });

      // 4. Verify flashcard
      console.log('🔵 Step 4: Verifying flashcard...');
      await test.step('Verify flashcard', async () => {
        // Wait for the flashcard to appear with increased timeout
        await flashcardManagementPage.waitForFlashcardsCount(1);
        
        // Verify the content
        const content = await flashcardManagementPage.getFlashcardContent(0);
        expect(content?.front).toBe(testFlashcard.front);
        expect(content?.back).toBe(testFlashcard.back);
        
        await page.screenshot({ path: 'test-results/4-flashcard-verified.png' });
      });

      // 5. Edit flashcard
      console.log('🔵 Step 5: Editing flashcard...');
      await test.step('Edit flashcard', async () => {
        const modifiedFront = testFlashcard.front + ' (edited)';
        await flashcardManagementPage.editFlashcard(0, modifiedFront, testFlashcard.back);
        
        // Wait for the edit to complete
        await page.waitForResponse(
          response => response.url().includes('/api/flashcards') && response.status() === 200,
          { timeout: TEST_CONFIG.TIMEOUTS.ACTION }
        );
        
        // Verify the edit
        const content = await flashcardManagementPage.getFlashcardContent(0);
        expect(content?.front).toBe(modifiedFront);
        
        await page.screenshot({ path: 'test-results/5-flashcard-edited.png' });
      });

      // 6. Delete flashcard
      console.log('🔵 Step 6: Deleting flashcard...');
      await test.step('Delete flashcard', async () => {
        await flashcardManagementPage.deleteFlashcard(0);
        
        // Wait for the delete to complete
        await page.waitForResponse(
          response => response.url().includes('/api/flashcards') && response.status() === 200,
          { timeout: TEST_CONFIG.TIMEOUTS.ACTION }
        );
        
        // Verify deletion
        await flashcardManagementPage.waitForFlashcardsCount(0);
        
        await page.screenshot({ path: 'test-results/6-flashcard-deleted.png' });
      });

      // 7. Logout
      console.log('🔵 Step 7: Logging out...');
      await test.step('Logout', async () => {
        await page.getByTestId('user-menu').click();
        await page.getByTestId('logout-button').click();
        
        // Wait for logout to complete
        await page.waitForURL('/auth/login');
        await page.waitForLoadState('networkidle');
        
        // Verify logout
        await expect(page.getByTestId('login-form')).toBeVisible();
        
        await page.screenshot({ path: 'test-results/7-logged-out.png' });
      });

      console.log('✅ Test completed successfully!');
    } catch (error) {
      console.error('Test failed:', error);
      if (!page.isClosed()) {
        // Take a full page screenshot
        await page.screenshot({ 
          path: 'test-results/error-state.png',
          fullPage: true 
        });
        
        // Log detailed state information
        console.log('Current URL:', page.url());
        console.log('Page HTML:', await page.content());
        
        // Log network requests safely
        try {
          const requests = await page.evaluate(() => {
            return performance.getEntriesByType('resource').map(entry => ({
              name: entry.name,
              duration: entry.duration,
              type: entry.entryType,
              startTime: entry.startTime
            }));
          });
          console.log('Network requests:', JSON.stringify(requests, null, 2));
        } catch (e) {
          console.warn('Could not get network requests:', e);
        }
        
        // Log storage state safely
        try {
          const storage = await page.context().storageState();
          console.log('Storage state:', JSON.stringify(storage, null, 2));
        } catch (e) {
          console.warn('Could not get storage state:', e);
        }
      }
      throw error;
    }
  });
});
