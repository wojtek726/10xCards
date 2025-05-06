import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import { TEST_CONFIG } from './e2e/test.config';

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: ['**/core-user-flow.spec.ts'],
  /* Maximum time one test can run for */
  timeout: TEST_CONFIG.TIMEOUTS.NAVIGATION,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met
     */
    timeout: TEST_CONFIG.TIMEOUTS.ELEMENT
  },
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: 2,
  /* Opt out of parallel tests on CI. */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['list'],
    ['html', { open: 'never' }]
  ],
  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: process.env.CI ? 'http://localhost:3000' : 'http://localhost:4321',
    /* Collect trace when retrying the failed test */
    trace: 'retain-on-failure',
    /* Take screenshots on failure */
    screenshot: 'on',
    /* Record video on failure */
    video: 'retain-on-failure',
    /* By default, playwright will ignore uncaught exceptions. We want to treat them as test failures */
    ignoreHTTPSErrors: true,
    /* Set actionability timeout */
    actionTimeout: TEST_CONFIG.TIMEOUTS.ACTION,
    /* Add test attributes */
    testIdAttribute: 'data-testid',
    /* Increase timeouts */
    navigationTimeout: TEST_CONFIG.TIMEOUTS.NAVIGATION,
    /* Dodatkowe ustawienia dla stabilności */
    viewport: { width: 1280, height: 720 },
    launchOptions: {
      slowMo: 100, /* Spowalniamy akcje dla stabilności */
    }
  },

  /* Configure projects for different browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    }
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: process.env.CI ? 'mkdir -p ./public/test && echo \'{"status": "ok"}\' > ./public/test/health.json && npm run dev:test' : 'npm run dev:test',
    url: process.env.CI ? 'http://localhost:3000/test/health.json' : 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
    timeout: 60000,
    env: {
      RUNNING_E2E: 'true',
      NODE_ENV: 'test',
      TEST_MODE: 'true',
      PORT: process.env.CI ? '3000' : '4321',
      HOST: 'localhost',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key'
    },
    cwd: process.cwd(),
  },

  /* Global setup and teardown */
  globalSetup: path.join(__dirname, 'e2e/setup/global-setup.ts'),
  
  /* Directories to generate outputs */
  outputDir: 'test-results/',
}); 