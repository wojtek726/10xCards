export const TEST_CONFIG = {
  TIMEOUTS: {
    NAVIGATION: 10000,
    HYDRATION: 5000,
    ELEMENT: 5000,
    NETWORK: 5000,
    VALIDATION: 1000,
    ANIMATION: 500
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
    }
  },
  ATTRIBUTES: {
    HYDRATED: 'data-hydrated',
    MOUNTED: 'data-mounted',
    BUSY: 'aria-busy'
  }
} as const; 