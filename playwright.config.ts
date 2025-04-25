import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

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
  timeout: 30000,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met
     */
    timeout: 10000
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 1,
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
    video: 'on-first-retry',
    /* By default, playwright will ignore uncaught exceptions. We want to treat them as test failures */
    ignoreHTTPSErrors: true,
    /* Set actionability timeout */
    actionTimeout: 10000,
    /* Add test attributes */
    testIdAttribute: 'data-testid',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'visual',
      testMatch: /visual\.spec\.ts/,
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
        colorScheme: 'light',
      },
      // No auth dependencies for visual tests
    },
    {
      name: 'e2e',
      testMatch: /^((?!visual\.spec\.ts).)*\.spec\.ts$/,
      use: { 
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/user.json',
        viewport: { width: 1280, height: 720 },
        colorScheme: 'light',
      },
      dependencies: ['setup'],
    },
    {
      name: 'e2e-mobile',
      use: { 
        ...devices['Pixel 5'],
        storageState: 'e2e/.auth/user.json',
        colorScheme: 'light',
      },
      dependencies: ['setup'],
    }
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev:test',
    url: 'http://localhost:4321',
    reuseExistingServer: false,
    stdout: 'pipe',
    stderr: 'pipe',
    timeout: 60000,
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