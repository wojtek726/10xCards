/**
 * This file provides utility functions and imports for E2E tests
 * that help avoid conflicts between Vitest and Playwright.
 */

// Import expect from Playwright directly with a name that won't conflict
import { expect as playwrightExpect } from '@playwright/test';

// Re-export with a unique name
export { playwrightExpect };

// Create a helper function to check if an element exists
export async function elementExists(locator: any): Promise<boolean> {
  try {
    const count = await locator.count();
    return count > 0;
  } catch (e) {
    return false;
  }
}

// Export helper functions for waiting with better error messages
export async function waitForElement(locator: any, timeoutMs = 5000): Promise<void> {
  await playwrightExpect(locator).toBeVisible({ timeout: timeoutMs });
}

// Help with logging
export function testLog(message: string): void {
  console.log(`[E2E Test] ${message}`);
} 