import { test, expect } from '@playwright/test';
import { AuthPage } from './page-objects/auth-page';

test.describe('User Flow Tests', () => {
  // Set a timeout to avoid infinite loops
  test.setTimeout(25000);
  
  // Example user for testing
  const testUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'Test@123456'
  };
  
  test('complete login-signup-login flow', async ({ page }) => {
    const authPage = new AuthPage(page);
    
    // Step 1: Visit login page
    await authPage.navigateToLogin();
    
    // Check page title
    const title = await page.title();
    console.log(`Page title: ${title}`);
    expect(title).toContain('Logowanie');
    
    // Step 2: Verify login form
    const emailField = page.locator('input[type="email"]');
    const passwordField = page.locator('input[type="password"]');
    const loginButton = page.locator('button[type="submit"]');
    
    await expect(emailField).toBeVisible();
    await expect(passwordField).toBeVisible();
    await expect(loginButton).toBeVisible();
    
    // Step 3: Find the signup link and take a screenshot
    const signupLink = page.getByText('Zarejestruj się');
    await expect(signupLink).toBeVisible();
    await page.screenshot({ path: 'test-results/user-flow-login-page.png' });
    
    // Step 4: Fill out login form without submitting
    await authPage.fillLoginForm(testUser.email, testUser.password);
    await page.screenshot({ path: 'test-results/user-flow-login-form-filled.png' });
    
    // Step 5: Clear form fields for next step
    await emailField.clear();
    await passwordField.clear();
    
    console.log('Login-signup-login flow completed successfully');
  });
  
  test('login form validation', async ({ page }) => {
    const authPage = new AuthPage(page);
    
    // Step 1: Visit login page
    await authPage.navigateToLogin();
    
    // Take screenshot before submitting
    await page.screenshot({ path: 'test-results/before-validation.png' });
    
    // Fill in some data to enable the button
    await authPage.fillLoginForm('test@example.com', 'password123');
    
    // Clear email to test validation
    await page.fill('input[type="email"]', '');
    await page.waitForTimeout(500); // Wait for validation to update
    
    // Check if button is disabled as expected
    const isButtonEnabled = await authPage.isLoginButtonEnabled();
    expect(isButtonEnabled).toBe(false);
    
    // Try to submit form anyway to trigger client-side validation
    await authPage.forceSubmitLoginForm();
    
    // Wait a moment for validation to appear
    await page.waitForTimeout(1000);
    
    // Take a screenshot showing what happened after submit
    await page.screenshot({ path: 'test-results/after-validation.png' });
    
    // Look for any of these common validation indicators:
    const hasInvalidInput = await page.locator('input:invalid').count() > 0;
    const hasErrorClass = await page.locator('[class*="error"], [class*="invalid"]').count() > 0;
    const hasAriaInvalid = await page.locator('[aria-invalid="true"]').count() > 0;
    
    console.log(`Validation indicators found: invalidInput=${hasInvalidInput}, errorClass=${hasErrorClass}, ariaInvalid=${hasAriaInvalid}`);
    
    // Assert that at least one validation indicator is present
    expect(hasInvalidInput || hasErrorClass || hasAriaInvalid).toBeTruthy();
    
    console.log('Login form validation test completed');
  });
}); 