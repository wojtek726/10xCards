export const TEST_TAGS = {
  SMOKE: '@smoke',
  CRITICAL: '@critical',
  REGRESSION: '@regression'
} as const;

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

export const TEST_CONFIG = {
  TIMEOUTS: {
    ELEMENT: 5000,
    NAVIGATION: 10000,
    ACTION: 3000,
    GENERATION: 15000,
    HYDRATION: 10000
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
      LIST_LINK: '[data-testid="flashcards-list-link"]',
      FRONT_INPUT: '[data-testid="flashcard-front-input"]',
      BACK_INPUT: '[data-testid="flashcard-back-input"]',
      SAVE_BUTTON: '[data-testid="save-flashcard"]',
      EDIT_BUTTON: '[data-testid="edit-flashcard"]',
      DELETE_BUTTON: '[data-testid="delete-flashcard"]',
      CONFIRM_DELETE: '[data-testid="confirm-delete"]',
      PREVIEW: '[data-testid="flashcard-preview"]'
    }
  },
  ATTRIBUTES: {
    HYDRATED: 'data-hydrated',
    MOUNTED: 'data-mounted',
    BUSY: 'aria-busy'
  }
} as const; 