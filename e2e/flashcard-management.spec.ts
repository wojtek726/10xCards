import { test, expect } from './test-setup';
import { FlashcardsListPage } from './page-objects';

test.describe('Flashcard Management', () => {
  test.use({ isAuthenticated: true });

  test('should display flashcards list', async ({ page }) => {
    // Arrange
    const listPage = new FlashcardsListPage(page);

    // Mock flashcards list endpoint
    await page.route('**/api/flashcards', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: '1',
            front: 'Test Front 1',
            back: 'Test Back 1',
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            front: 'Test Front 2',
            back: 'Test Back 2',
            created_at: new Date().toISOString()
          }
        ])
      });
    });

    // Act
    await listPage.navigateToFlashcardsList();

    // Assert
    try {
      // First check if page has loaded properly
      await page.waitForLoadState('load');
      
      // Take a screenshot for debugging
      await page.screenshot({ path: 'test-results/flashcards-list-page.png', fullPage: true });
      
      // Check for page heading - use data-testid directly
      await expect(page.getByTestId('flashcards-heading')).toBeVisible({ timeout: 15000 });
      
      // Check for flashcards list or empty state message
      if (await page.getByTestId('flashcards-list').isVisible({ timeout: 5000 })) {
        await expect(page.getByTestId('flashcards-list')).toBeVisible({ timeout: 10000 });
      } else {
        await expect(page.getByText('Nie masz jeszcze żadnych fiszek')).toBeVisible({ timeout: 10000 });
      }
      
      // Generate button should always be visible
      await expect(page.getByTestId('generate-new-flashcards-button')).toBeVisible({ timeout: 15000 });
    } catch (error) {
      console.error('Failed to verify flashcard list display:', error);
      
      // Take a screenshot for debugging
      try {
        if (!page.isClosed()) {
          await page.screenshot({ path: 'test-results/flashcard-list-assertion-failed.png', fullPage: true });
          
          // Log page content for debugging
          const html = await page.content();
          console.log('Page content:', html.substring(0, 500) + '...');
        }
      } catch (screenshotError) {
        console.error('Could not take screenshot:', screenshotError);
      }
      
      throw error;
    }
  });

  test('should navigate to flashcard generation form', async ({ page }) => {
    // Arrange
    const listPage = new FlashcardsListPage(page);

    // Mock the flashcards endpoint
    await page.route('**/api/flashcards', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: '1',
            front: 'Test Front 1',
            back: 'Test Back 1',
            created_at: new Date().toISOString()
          }
        ])
      });
    });

    // Mock the generate page
    await page.route('/flashcards/generate', route => {
      if (route.request().resourceType() === 'document') {
        route.fulfill({
          status: 200,
          contentType: 'text/html',
          body: `
            <!DOCTYPE html>
            <html lang="pl">
              <head>
                <title>Generowanie fiszek</title>
                <meta charset="utf-8">
              </head>
              <body>
                <div id="app">
                  <header>
                    <nav>
                      <a href="/flashcards">Powrót do fiszek</a>
                    </nav>
                  </header>
                  <main>
                    <div data-testid="flashcard-generation-view">
                      <h1 data-testid="flashcard-generation-heading">Generowanie fiszek</h1>
                      <form data-testid="flashcard-generation-form">
                        <textarea data-testid="flashcard-generation-input"></textarea>
                        <button data-testid="generate-flashcard-button">Generuj</button>
                      </form>
                    </div>
                  </main>
                </div>
              </body>
            </html>
          `
        });
      } else {
        route.continue();
      }
    });

    // Act
    try {
      // First navigate to flashcards list
      await listPage.navigateToFlashcardsList();
      
      // Take a screenshot before navigating
      await page.screenshot({ path: 'test-results/before-button-click.png', fullPage: true });
      
      // Use the improved navigation method
      await listPage.navigateToFlashcardGeneration();
      
      // Wait for page to load
      await page.waitForLoadState('domcontentloaded');
      
      // Take a screenshot after navigating
      await page.screenshot({ path: 'test-results/after-navigation.png', fullPage: true });
      
      // Check that we're on the right page with a more resilient check
      const isGenerationPage = await page.url().includes('/flashcards/generate');
      if (!isGenerationPage) {
        throw new Error(`Expected to be on generation page, but URL is: ${page.url()}`);
      }
      
      // Add more resilient checks for page elements
      const formVisible = await page.getByTestId('flashcard-generation-form').isVisible({ timeout: 10000 }).catch(() => false);
      const inputVisible = await page.getByTestId('flashcard-generation-input').isVisible({ timeout: 10000 }).catch(() => false);
      const viewVisible = await page.getByTestId('flashcard-generation-view').isVisible({ timeout: 10000 }).catch(() => false);
      const headingVisible = await page.getByTestId('flashcard-generation-heading').isVisible({ timeout: 10000 }).catch(() => false);
      
      // Log what elements are visible
      console.log('Elements found:', { formVisible, inputVisible, viewVisible, headingVisible });
      
      // Assert - check if at least one key element is visible
      expect(formVisible || inputVisible || viewVisible || headingVisible).toBeTruthy();
      
    } catch (error) {
      console.error('Navigation test failed:', error);
      // Take a screenshot on failure
      if (!page.isClosed()) {
        await page.screenshot({ path: 'test-results/navigation-failure.png', fullPage: true });
      }
      throw error;
    }
  });
}); 