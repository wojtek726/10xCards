import { test as baseTest } from '../test-environment';
import type { Page } from '@playwright/test';
import { LoginPage } from '../page-objects/login-page';
import { SignupPage } from '../page-objects/signup-page';
import { FlashcardsPage } from '../page-objects/flashcards-page';
import { FlashcardManagementPage } from '../page-objects/flashcard-management.page';

export type PageObjects = {
  loginPage: LoginPage;
  signupPage: SignupPage;
  flashcardsPage: FlashcardsPage;
  flashcardManagementPage: FlashcardManagementPage;
};

// Extend base test with page object fixtures
export const test = baseTest.extend<PageObjects>({
  loginPage: async ({ page }: { page: Page }, use: (r: LoginPage) => Promise<void>) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },
  signupPage: async ({ page }: { page: Page }, use: (r: SignupPage) => Promise<void>) => {
    const signupPage = new SignupPage(page);
    await use(signupPage);
  },
  flashcardsPage: async ({ page }: { page: Page }, use: (r: FlashcardsPage) => Promise<void>) => {
    const flashcardsPage = new FlashcardsPage(page);
    await use(flashcardsPage);
  },
  flashcardManagementPage: async ({ page }: { page: Page }, use: (r: FlashcardManagementPage) => Promise<void>) => {
    const flashcardManagementPage = new FlashcardManagementPage(page);
    await use(flashcardManagementPage);
  },
}); 