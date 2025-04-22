# Testing Framework Documentation

This project uses two main testing frameworks:
1. **Vitest** for unit and integration testing
2. **Playwright** for end-to-end (E2E) testing

## Unit and Integration Testing with Vitest

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Test Structure

Unit tests are located alongside the code they test with the `.test.ts` or `.test.tsx` extension. For example:
- `src/components/Button.tsx` → `src/components/Button.test.tsx`

### Test Setup

Global test setup is defined in `tests/setup.ts`. This includes:
- Jest DOM matchers
- Mock Service Worker (MSW) setup
- Global mocks for browser APIs

### Testing React Components

We use React Testing Library to test React components. Example:

```tsx
import { render, screen } from '@testing-library/react';
import { expect, it, describe } from 'vitest';
import Button from './Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });
});
```

### Mocking API Requests with MSW

To mock API calls in tests, we use Mock Service Worker (MSW). Example:

```tsx
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

// Setup mock server
const server = setupServer(
  http.get('/api/data', () => {
    return HttpResponse.json({ message: 'Mocked data' });
  })
);

// Start the server before tests
beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Test using the mock
it('fetches data', async () => {
  const response = await fetch('/api/data');
  const data = await response.json();
  expect(data.message).toBe('Mocked data');
});
```

## End-to-End Testing with Playwright

### Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Debug tests
npm run test:e2e:debug
```

### Test Structure

E2E tests are located in the `e2e` directory and follow the Page Object Model pattern:
- `e2e/page-objects/` - Contains page objects
- `e2e/*.spec.ts` - Contains the actual tests

### Page Object Model

Example of a page object:

```ts
// e2e/page-objects/home-page.ts
import type { Page, Locator } from '@playwright/test';
import { expect } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly heading: Locator;
  
  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { level: 1 });
  }

  async goto() {
    await this.page.goto('/');
  }

  async isVisible() {
    await expect(this.heading).toBeVisible();
  }
}
```

Example of using a page object in a test:

```ts
// e2e/home.spec.ts
import { test, expect } from '@playwright/test';
import { HomePage } from './page-objects/home-page';

test('should load the home page', async ({ page }) => {
  // Arrange
  const homePage = new HomePage(page);
  
  // Act
  await homePage.goto();
  
  // Assert
  await homePage.isVisible();
  await expect(page).toHaveTitle(/My App/);
});
```

### Visual Testing

Playwright supports visual testing with screenshots:

```ts
// Take a screenshot and compare with baseline
await expect(page).toHaveScreenshot('homepage.png');
```

## Best Practices

1. **Follow the AAA pattern**: Arrange, Act, Assert
2. **Keep tests isolated**: Each test should be independent
3. **Test behavior, not implementation**: Focus on what the component does, not how it does it
4. **Use appropriate selectors**: Prefer accessible selectors like `getByRole` over CSS selectors
5. **Mock external dependencies**: Use MSW to mock API calls
6. **Focus on coverage**: Aim for high test coverage but prioritize testing critical paths

## Troubleshooting

### Common Issues

1. **Tests not finding elements**:
   - Check your selectors
   - Use `screen.debug()` to see the rendered HTML
   - Use `await findByText()` for elements that appear asynchronously

2. **MSW not intercepting requests**:
   - Make sure the server is started before tests
   - Check the URL path and method match exactly
   - Use `onUnhandledRequest: 'bypass'` when setting up the server

3. **Playwright tests failing**:
   - Check if the application is running on the expected port
   - Use `test.only()` to run a specific test
   - Run with `npm run test:e2e:debug` for visual debugging 