import { test, expect } from '@playwright/test';
import { TEST_CONFIG } from '../test.config';

test.describe('Form Hydration Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Disable transitions and animations for more reliable tests
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          transition: none !important;
          animation: none !important;
        }
      `
    });
  });

  test('login form should properly hydrate and mount', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Wait for hydration
    await expect(page.locator('html')).toHaveAttribute(
      TEST_CONFIG.ATTRIBUTES.HYDRATED,
      'true'
    );

    // Wait for form mounting
    const loginForm = page.locator(TEST_CONFIG.SELECTORS.FORM.LOGIN);
    await expect(loginForm).toBeVisible();
    await expect(loginForm).toHaveAttribute(
      TEST_CONFIG.ATTRIBUTES.MOUNTED,
      'true'
    );

    // Check if form is not busy initially
    await expect(loginForm).not.toHaveAttribute(TEST_CONFIG.ATTRIBUTES.BUSY);

    // Check if all required elements are present
    await expect(page.locator(TEST_CONFIG.SELECTORS.INPUTS.EMAIL)).toBeVisible();
    await expect(page.locator(TEST_CONFIG.SELECTORS.INPUTS.PASSWORD)).toBeVisible();
    await expect(page.locator(TEST_CONFIG.SELECTORS.BUTTONS.LOGIN)).toBeVisible();
  });

  test('register form should properly hydrate and mount', async ({ page }) => {
    await page.goto('/auth/signup');
    
    // Wait for hydration
    await expect(page.locator('html')).toHaveAttribute(
      TEST_CONFIG.ATTRIBUTES.HYDRATED,
      'true'
    );

    // Wait for form mounting
    const registerForm = page.locator(TEST_CONFIG.SELECTORS.FORM.REGISTER);
    await expect(registerForm).toBeVisible();
    await expect(registerForm).toHaveAttribute(
      TEST_CONFIG.ATTRIBUTES.MOUNTED,
      'true'
    );

    // Check if form is not busy initially
    await expect(registerForm).not.toHaveAttribute(TEST_CONFIG.ATTRIBUTES.BUSY);

    // Check if all required elements are present
    await expect(page.locator(TEST_CONFIG.SELECTORS.INPUTS.EMAIL)).toBeVisible();
    await expect(page.locator(TEST_CONFIG.SELECTORS.INPUTS.PASSWORD)).toBeVisible();
    await expect(page.locator(TEST_CONFIG.SELECTORS.INPUTS.CONFIRM_PASSWORD)).toBeVisible();
    await expect(page.locator(TEST_CONFIG.SELECTORS.BUTTONS.REGISTER)).toBeVisible();
  });

  test('reset password form should properly hydrate and mount', async ({ page }) => {
    await page.goto('/auth/reset-password');
    
    // Wait for hydration
    await expect(page.locator('html')).toHaveAttribute(
      TEST_CONFIG.ATTRIBUTES.HYDRATED,
      'true'
    );

    // Wait for form mounting
    const resetForm = page.locator(TEST_CONFIG.SELECTORS.FORM.RESET_PASSWORD);
    await expect(resetForm).toBeVisible();
    await expect(resetForm).toHaveAttribute(
      TEST_CONFIG.ATTRIBUTES.MOUNTED,
      'true'
    );

    // Check if form is not busy initially
    await expect(resetForm).not.toHaveAttribute(TEST_CONFIG.ATTRIBUTES.BUSY);

    // Check if all required elements are present
    await expect(page.locator(TEST_CONFIG.SELECTORS.INPUTS.EMAIL)).toBeVisible();
  });

  test('forms should show busy state during submission', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Get form elements
    const loginForm = page.locator(TEST_CONFIG.SELECTORS.FORM.LOGIN);
    const emailInput = page.locator(TEST_CONFIG.SELECTORS.INPUTS.EMAIL);
    const passwordInput = page.locator(TEST_CONFIG.SELECTORS.INPUTS.PASSWORD);
    const submitButton = page.locator(TEST_CONFIG.SELECTORS.BUTTONS.LOGIN);

    // Fill form with invalid data to trigger loading state
    await emailInput.fill('test@example.com');
    await passwordInput.fill('wrongpassword');
    
    // Submit form
    await submitButton.click();

    // Check if form shows busy state
    await expect(loginForm).toHaveAttribute(TEST_CONFIG.ATTRIBUTES.BUSY, 'true');
    await expect(submitButton).toBeDisabled();

    // Wait for error state
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();

    // Check if busy state is removed after error
    await expect(loginForm).not.toHaveAttribute(TEST_CONFIG.ATTRIBUTES.BUSY);
    await expect(submitButton).not.toBeDisabled();
  });
}); 