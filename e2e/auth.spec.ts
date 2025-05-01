import { test } from './fixtures/page-objects';
import { mockAuthApi } from './mocks/auth-api';
import { expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthApi(page);
  });

  test.describe('Login', () => {
    test('shows error message on failed login with invalid email', async ({ loginPage }) => {
      await loginPage.goto();
      await loginPage.login('invalid-email', 'password123');
      await loginPage.expectErrorMessage('Invalid email format');
    });

    test('shows error message on failed login with invalid credentials', async ({ loginPage }) => {
      await loginPage.goto();
      await loginPage.login('test@example.com', 'wrongpassword');
      await loginPage.expectErrorMessage('Invalid login credentials');
    });

    test('successful login redirects to flashcards', async ({ page, loginPage }) => {
      await loginPage.goto();
      await loginPage.login('test@example.com', 'password123');
      await loginPage.expectSuccessMessage('Login successful');
      await expect(page).toHaveURL('/flashcards');
    });

    test('shows loading state during login', async ({ loginPage, page }) => {
      await loginPage.goto();
      await loginPage.fillEmail('test@example.com');
      await loginPage.fillPassword('password123');
      
      // Start observing the submit button
      const submitPromise = loginPage.submit();
      await expect(page.getByTestId('loading-spinner')).toBeVisible();
      await submitPromise;
    });

    test('login button is disabled when form is empty', async ({ loginPage }) => {
      await loginPage.goto();
      await loginPage.expectSubmitButtonToBeDisabled();
    });
  });

  test.describe('Registration', () => {
    test('validates matching passwords', async ({ signupPage }) => {
      await signupPage.goto();
      await signupPage.signup('test@example.com', 'password123', 'differentpassword');
      await signupPage.expectPasswordMismatchError();
    });

    test('validates password length', async ({ signupPage }) => {
      await signupPage.goto();
      await signupPage.signup('test@example.com', 'short', 'short');
      await signupPage.expectPasswordLengthError();
    });

    test('successful registration redirects to flashcards', async ({ page, signupPage }) => {
      await signupPage.goto();
      await signupPage.signup('newuser@example.com', 'password123', 'password123');
      await signupPage.expectSuccessMessage('Registration successful');
      await expect(page).toHaveURL('/flashcards');
    });

    test('register button is disabled when form is empty', async ({ signupPage }) => {
      await signupPage.goto();
      await signupPage.expectSubmitButtonToBeDisabled();
    });
  });

  test.describe('Form validation', () => {
    test('login button is disabled when form is empty', async ({ loginPage }) => {
      await loginPage.goto();
      await loginPage.expectSubmitButtonToBeDisabled();
    });

    test('register button is disabled when form is empty', async ({ signupPage }) => {
      await signupPage.goto();
      await signupPage.expectSubmitButtonToBeDisabled();
    });
  });
});