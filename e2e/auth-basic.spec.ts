import { test, expect } from '@playwright/test';

test.describe('Basic Auth Pages', () => {
  test('should navigate to login page', async ({ page }) => {
    // Navigate to login page
    await page.goto('/auth/login', { waitUntil: 'networkidle' });
    
    // Check if the email and password fields are present using data-testid
    const emailField = await page.getByTestId('email-input').isVisible();
    const passwordField = await page.getByTestId('password-input').isVisible();
    
    expect(emailField).toBeTruthy();
    expect(passwordField).toBeTruthy();
    
    // Check if the submit button is present
    const submitButton = await page.getByTestId('login-submit').isVisible();
    expect(submitButton).toBeTruthy();
  });

  test('should navigate to signup page', async ({ page }) => {
    // Navigate to signup page
    await page.goto('/auth/signup', { waitUntil: 'networkidle' });
    
    // Check if the email and password fields are present using data-testid
    const emailField = await page.getByTestId('email-input').isVisible();
    const passwordField = await page.getByTestId('password-input').isVisible();
    const confirmPasswordField = await page.getByTestId('confirm-password-input').isVisible();
    
    expect(emailField).toBeTruthy();
    expect(passwordField).toBeTruthy();
    expect(confirmPasswordField).toBeTruthy();
    
    // Check if the submit button is present
    const submitButton = await page.getByTestId('register-submit').isVisible();
    expect(submitButton).toBeTruthy();
  });
}); 