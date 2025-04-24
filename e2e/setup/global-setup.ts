import { chromium } from '@playwright/test';
import type { FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Global setup for E2E tests
 * - Creates necessary directories for test artifacts
 * - Sets up any global state needed for tests
 */
export default async function globalSetup(_config: FullConfig): Promise<void> {
  // Prevent conflicts with Vitest's expect
  const globalAny = global as any;
  // Save any existing expect
  const originalExpect = globalAny.expect;
  
  // Create directories for test artifacts if they don't exist
  const testResultsDir = path.join(process.cwd(), 'test-results');
  const screenshotsDir = path.join(testResultsDir, 'screenshots');
  const visualDir = path.join(testResultsDir, 'visual');
  
  if (!fs.existsSync(testResultsDir)) {
    fs.mkdirSync(testResultsDir, { recursive: true });
  }
  
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
  
  if (!fs.existsSync(visualDir)) {
    fs.mkdirSync(visualDir, { recursive: true });
  }
  
  // Launch browser for global setup
  const browser = await chromium.launch();
  
  // Close browser when done
  await browser.close();
  
  // Restore the original expect if it was present
  if (originalExpect) {
    globalAny.expect = originalExpect;
  }
  
  console.log('✅ Global setup complete');
} 