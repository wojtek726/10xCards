import { test, expect } from '@playwright/test';

// Konfiguracja specyficzna dla CI
test.use({
  baseURL: 'http://localhost:3000',
  ignoreHTTPSErrors: true,
  screenshot: 'on',
  video: 'on',
  trace: 'on'
});

// Super podstawowe testy tylko do CI
test.describe('CI Basic Tests', () => {
  // Wspólna konfiguracja dla wszystkich testów
  test.beforeEach(async ({ page }) => {
    console.log('Starting test in CI environment');
    page.setDefaultTimeout(60000); // Dłuższy timeout dla CI
  });

  test('static file access works', async ({ request }) => {
    try {
      // Sprawdź, czy możemy uzyskać dostęp do statycznego pliku
      console.log('Attempting to access static health file');
      const response = await request.get('/test/health.json');
      console.log('Health file response status:', response.status());
      
      expect(response.status()).toBe(200);
      const body = await response.json();
      console.log('Health file content:', JSON.stringify(body));
      expect(body.status).toBe('ok');
    } catch (error) {
      console.error('Error during health check:', error);
      // Spróbuj uzyskać dostęp do katalogu głównego
      const rootResponse = await request.get('/');
      console.log('Root response status:', rootResponse.status());
      throw error;
    }
  });
  
  test('static HTML can load', async ({ page }) => {
    try {
      // Bardzo prosty test strony głównej bez skomplikowanych operacji
      console.log('Navigating to root page');
      await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30000 });
      
      const title = await page.title();
      console.log('Page title:', title);
      
      // Sprawdź, czy strona w ogóle się załadowała
      const body = await page.evaluate(() => document.body.innerHTML);
      console.log('Body HTML length:', body.length);
      expect(body.length).toBeGreaterThan(0);
      
      // Zrób screenshot dla debugowania w CI
      await page.screenshot({ path: 'ci-home-page.png', fullPage: true });
    } catch (error) {
      console.error('Error during page navigation test:', error);
      // Nawet jeśli nie można załadować strony, zrób zrzut ekranu obecnego stanu
      await page.screenshot({ path: 'ci-error-page.png', fullPage: true });
      throw error;
    }
  });
}); 