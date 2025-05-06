import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import { TEST_CONFIG } from './e2e/test.config';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Specjalna konfiguracja Playwright dla środowiska CI
 * - Używa istniejącego serwera w CI
 * - Używa dłuższych timeoutów
 * - Ma włączoną pełną diagnostykę
 * - Traktuje pierwsze testy jako podstawowy test życia serwera
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: ['**/ci-basic.spec.ts'],
  
  // Dłuższe timeouty dla CI
  timeout: TEST_CONFIG.TIMEOUTS.NAVIGATION * 2,
  expect: {
    timeout: TEST_CONFIG.TIMEOUTS.ELEMENT * 2
  },
  
  fullyParallel: false,
  forbidOnly: true,
  retries: 2,
  workers: 1,
  
  // Pełne raportowanie dla CI
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/test-results.json' }]
  ],
  
  use: {
    // Adres serwera uruchomionego w GitHub Actions
    baseURL: 'http://localhost:3000',
    
    // Włącz pełną diagnostykę
    trace: 'on',
    screenshot: 'on',
    video: 'on',
    
    // Ignoruj błędy HTTPS i JS
    ignoreHTTPSErrors: true,
    
    // Dłuższe timeouty
    actionTimeout: TEST_CONFIG.TIMEOUTS.ACTION * 2,
    navigationTimeout: TEST_CONFIG.TIMEOUTS.NAVIGATION * 2,
    
    // Standardowy rozmiar viewport
    viewport: { width: 1280, height: 720 },
    
    // Bez spowalniania w CI
    launchOptions: {
      slowMo: 0
    }
  },
  
  // Tylko jeden projekt - Chromium
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    }
  ],
  
  // Używaj istniejącego serwera w CI
  webServer: {
    command: 'echo "Using existing server"',
    url: 'http://localhost:3000/test/health.json',
    reuseExistingServer: true,
    timeout: 60000,
  },
  
  // Katalog wyjściowy
  outputDir: 'test-results/ci',
}); 