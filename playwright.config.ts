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
  testMatch: ['**/*.spec.ts'],
  /* Maximum time one test can run for */
  timeout: TEST_CONFIG.TIMEOUTS.NAVIGATION,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met
     */
    timeout: TEST_CONFIG.TIMEOUTS.ELEMENT
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['list']
  ],
  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: 'http://localhost:4321',
    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',
    /* Take screenshots on failure */
    screenshot: 'only-on-failure',
    /* Record video on failure */
    video: 'retain-on-failure',
    /* By default, playwright will ignore uncaught exceptions. We want to treat them as test failures */
    ignoreHTTPSErrors: true,
    /* Set actionability timeout */
    actionTimeout: TEST_CONFIG.TIMEOUTS.ELEMENT,
    /* Add test attributes */
    testIdAttribute: 'data-testid',
    /* Increase timeouts */
    navigationTimeout: TEST_CONFIG.TIMEOUTS.NAVIGATION,
  },

  /* Configure projects for different browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
    timeout: 120000,
    env: {
      RUNNING_E2E: 'true',
      NODE_ENV: 'test',
      PORT: '4321',
      HOST: 'localhost'
    },
    cwd: process.cwd(),
    ignoreHTTPSErrors: true,
  },

  /* Global setup and teardown */
  globalSetup: path.join(__dirname, 'e2e/setup/global-setup.ts'),
  
  /* Directories to generate outputs */
  outputDir: 'test-results/',
}); 