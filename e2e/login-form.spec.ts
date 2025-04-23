import { test, expect } from '@playwright/test';

test.describe('Login Form Interaction', () => {
  test('should fill login form with valid credentials', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Wait for login form elements to be visible
    await page.waitForSelector('input[type="email"]');
    await page.waitForSelector('input[type="password"]');
    
    // Fill form fields
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    
    // Take a screenshot of the filled form
    await page.screenshot({ path: 'test-results/login-form-filled.png' });
    
    // Don't submit the form as it would actually attempt to log in
    console.log('Form filled successfully');
  });
}); 