import type { Page } from '@playwright/test';
import { setupAuthMocks, setupFlashcardMocks } from './mocks';

// Tagi testowe
export const TEST_TAGS = {
  SMOKE: '@smoke',
  CRITICAL: '@critical',
  REGRESSION: '@regression'
} as const;

// Zestawy testów
export const TEST_SUITES = {
  SMOKE: {
    name: 'smoke',
    pattern: '@smoke',
    description: 'Basic functionality tests that should always pass'
  },
  CRITICAL: {
    name: 'critical',
    pattern: '@critical',
    description: 'Tests for core business functionality'
  },
  REGRESSION: {
    name: 'regression',
    pattern: '@regression',
    description: 'Full regression test suite'
  }
} as const;

// Konfiguracja testów
export const TEST_CONFIG = {
  TIMEOUTS: {
    ELEMENT: 5000,
    ELEMENT_EXTENDED: 10000,
    NAVIGATION: 10000,
    ACTION: 10000,
    ACTION_EXTENDED: 20000,
    GENERATION: 15000,
    HYDRATION: 10000,
    ANIMATION: 1000,
    RETRY: 5000
  },
  RETRIES: {
    SMOKE: 2,
    CRITICAL: 2,
    REGRESSION: 1
  },
  SELECTORS: {
    FORM: {
      LOGIN: '[data-testid="login-form"]',
      REGISTER: '[data-testid="register-form"]',
      RESET_PASSWORD: '[data-testid="reset-password-form"]'
    },
    INPUTS: {
      EMAIL: '[data-testid="email-input"]',
      PASSWORD: '[data-testid="password-input"]',
      CONFIRM_PASSWORD: '[data-testid="confirm-password-input"]'
    },
    BUTTONS: {
      SUBMIT: '[data-testid="submit-button"]',
      LOGIN: '[data-testid="login-submit"]',
      REGISTER: '[data-testid="register-submit"]'
    },
    FLASHCARDS: {
      CREATE_BUTTON: '[data-testid="create-flashcard-button"]',
      LIST_LINK: '[data-testid="flashcards-list"]',
      FRONT_INPUT: '[data-testid="flashcard-front-input"]',
      BACK_INPUT: '[data-testid="flashcard-back-input"]',
      SAVE_BUTTON: '[data-testid="save-flashcard-button"]',
      EDIT_BUTTON: '[data-testid="edit-flashcard-button"]',
      DELETE_BUTTON: '[data-testid="delete-flashcard-button"]',
      CONFIRM_DELETE: '[data-testid="confirm-delete-button"]',
      PREVIEW: '[data-testid="flashcard-preview"]'
    }
  },
  ATTRIBUTES: {
    HYDRATED: 'data-hydrated',
    MOUNTED: 'data-mounted',
    BUSY: 'aria-busy'
  }
} as const;

// Konfiguracja środowiska testowego
export const setupTestEnvironment = async (page: Page, options: { isAuthenticated?: boolean } = {}) => {
  // Set timeouts
  page.setDefaultNavigationTimeout(TEST_CONFIG.TIMEOUTS.NAVIGATION);
  page.setDefaultTimeout(TEST_CONFIG.TIMEOUTS.ELEMENT);

  // Setup mocks
  await setupAuthMocks(page);
  await setupFlashcardMocks(page);

  if (options.isAuthenticated) {
    // Navigate to the app domain first
    await page.goto('/');
  }
}; 