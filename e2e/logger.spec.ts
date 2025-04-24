import { test, expect } from '@playwright/test';
import { logger } from '../src/lib/services/logger.service';

test.describe('Logger Service E2E Tests', () => {
  test('should handle logging in browser context', async ({ page }) => {
    // Setup console message listener
    const messages: string[] = [];
    page.on('console', msg => {
      messages.push(msg.text());
    });

    // Navigate to home page which uses logger
    await page.goto('/');
    
    // Verify that debug messages are present in development
    expect(messages.some(msg => msg.includes('[DEBUG]'))).toBeTruthy();
    
    // Test the new GitHub Actions test function
    expect(logger.testGithubActions('e2e-test')).toBe('e2e-test');
  });
}); 