# E2E Testing with Playwright

This directory contains end-to-end tests for the 10x-cards application using Playwright.

## Structure

- `*.spec.ts` - Test files
- `page-objects/` - Page Object Models for different pages and components
  - `BasePage.ts` - Base class for all page objects
  - `AuthPage.ts` - Authentication-related page object
  - `FlashcardsListPage.ts` - Flashcards list page object
  - `FlashcardGenerationPage.ts` - Flashcard generation page object
- `test-setup.ts` - Common test setup and fixtures
- `run-basic-tests.sh` - Script to run basic tests that are stable

## Getting Started

### Prerequisites

- Node.js v18+ installed
- Project dependencies installed (`npm install`)
- Project running locally (`npm run dev` in another terminal)

### Running Tests

```bash
# Run all E2E tests (may include some failing tests during development)
npm run test:e2e

# Run only stable tests
./e2e/run-basic-tests.sh

# Run a specific test with the basic test runner
./e2e/run-basic-tests.sh e2e/auth-basic.spec.ts

# Run tests with specific grep pattern
./e2e/run-basic-tests.sh -g "should navigate to login page"

# Run tests with UI mode (for debugging)
npm run test:e2e:ui

# Run tests in debug mode
npm run test:e2e:debug

# Run specific test file
npx playwright test e2e/auth-basic.spec.ts
```

### Generating Tests

You can use Playwright's codegen tool to record interactions and generate test code:

```bash
npx playwright codegen http://localhost:3000
```

## Common Patterns for Stable Tests

### 1. Adding data-testid attributes

All important elements in our UI should have `data-testid` attributes:

```tsx
// Example of proper data-testid usage
<form data-testid="login-form">
  <input data-testid="email-input" />
  <input data-testid="password-input" />
  <button data-testid="submit-button">Login</button>
</form>
```

### 2. Using resilient selectors

Use selectors in this order of preference:
1. `data-testid` attributes 
2. Semantic roles with names
3. Text content
4. CSS classes (as a last resort, and be specific)

### 3. Proper waiting strategies

- Use `waitForSelector` with appropriate timeouts
- Wrap navigations in try/catch blocks
- Prefer `waitUntil: 'load'` over `waitUntil: 'networkidle'` for better reliability

### 4. Error handling

Always implement proper error handling in page objects:

```typescript
async navigateToSomePage() {
  try {
    await this.goto('/some-page');
    await this.page.waitForSelector('[data-testid="important-element"]', { 
      state: 'visible', 
      timeout: 30000 
    });
  } catch (error) {
    console.error('Failed to navigate to some page:', error);
    // Take screenshots for debugging
    await this.page.screenshot({ 
      path: 'test-results/navigation-failed.png', 
      fullPage: true 
    });
    throw error;
  }
}
```

### 5. Mock external dependencies

Always mock API responses for predictable test behavior:

```typescript
// Mock API responses
await page.route('**/api/endpoint', route => {
  route.fulfill({
    status: 200,
    body: JSON.stringify({
      // Your mock data here
    })
  });
});
```

## Best Practices

1. **Follow the Page Object Model (POM)** - Encapsulate page-specific logic in POM classes
2. **Test one thing per test** - Each test should verify one specific aspect of functionality
3. **Make tests independent** - No dependencies between tests
4. **Use the AAA pattern** - Arrange, Act, Assert
5. **Add proper error handling** - Use try/catch and take screenshots for debugging
6. **Mock external dependencies** - For consistent test results
7. **Use data-testid attributes** - For reliable element selection
8. **Handle timeouts gracefully** - With appropriate waiting strategies
9. **Implement proper authentication handling** - Using the `isAuthenticated: true` fixture
10. **Keep visual tests separate** - As they can be more brittle

## Troubleshooting

### Common Issues

1. **Element not found** - Check if the element has proper `data-testid` attribute
2. **Timeout errors** - Increase timeouts or use more resilient waiting strategies
3. **Authentication problems** - Check the authentication setup in `test-setup.ts`
4. **Multiple elements matching selector** - Use more specific selectors
5. **Inconsistent API responses** - Ensure proper API mocking

### Debugging Strategies

1. **Use Playwright UI Mode**: `npx playwright test --ui`
2. **Review screenshots and videos**: Check the `test-results/` directory
3. **Trace viewer**: `npx playwright show-trace test-results/trace.zip`
4. **Console logs**: Add `console.log` statements to your tests
5. **Step-by-step execution**: Use `await page.pause()` to pause execution 