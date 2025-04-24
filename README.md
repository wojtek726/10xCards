# 10x Cards

Test workflow update.

## Project Description
10xCards is a web application that allows users to securely manage their accounts and access personalized flashcards. Users can register, log in, change their password, and delete their account. Each user has their individual set of flashcards.

## Tech Stack
**Frontend:**
- Astro 5
- React 19 (for interactive components)
- TypeScript 5
- Tailwind CSS 4
- Shadcn/ui

**Backend:**
- Supabase (PostgreSQL, authentication, and as a Backend-as-a-Service)

**AI Integration:**
- Openrouter.ai (integration with multiple AI models, such as OpenAI, Anthropic, Google, etc.)

**Testing Framework:**
- Vitest - Unit and integration testing
- Playwright - End-to-end testing
- React Testing Library - Component testing
- MSW (Mock Service Worker) - API mocking
- Lighthouse - Performance testing

**CI/CD & Hosting:**
- GitHub Actions
- DigitalOcean (Docker based hosting)

## Getting Started Locally
1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```bash
   cd 10xCards
   ```
3. Use the Node version defined in `.nvmrc`:
   ```bash
   nvm use
   ```
4. Install dependencies:
   ```bash
   npm install
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```
6. Open your browser at [http://localhost:3000](http://localhost:3000).

## Available Scripts
- `npm run dev` – Start the development server.
- `npm run build` – Build the project for production.
- `npm run preview` – Preview the production build.
- `npm run astro` – Run Astro commands.
- `npm run lint` – Lint the project.
- `npm run lint:fix` – Automatically fix lint errors.
- `npm run format` – Format code using Prettier.
- `npm run test` – Run unit and integration tests with Vitest.
- `npm run test:watch` – Run tests in watch mode.
- `npm run test:ui` – Run tests with Vitest UI.
- `npm run test:coverage` – Generate test coverage report.
- `npm run test:e2e` – Run end-to-end tests with Playwright.
- `npm run test:e2e:ui` – Run Playwright tests with UI.
- `npm run test:e2e:debug` – Debug Playwright tests.

## Testing Framework

### Unit Testing with Vitest
We use Vitest for unit and integration testing. Tests are located in the same directory as the code they test, with the `.test.ts` or `.test.tsx` extension.

Key features:
- Fast test execution with watch mode
- UI interface for test exploration
- Coverage reporting
- Compatible with Jest API

### E2E Testing with Playwright
End-to-end tests use Playwright and follow the Page Object Model pattern. Tests are located in the `e2e` directory.

Key features:
- Single browser testing (Chromium)
- Screenshot testing
- Trace viewer for debugging
- Page Object Model for maintainable tests
- Parallel test execution

Both testing frameworks follow the Arrange-Act-Assert pattern for clear and readable tests.

## Project Scope
- **User Management:** Securely register, log in, change password, and delete account.
- **Flashcards:** Personal sets of flashcards unique to each user.

## Project Status
Currently, the project is in its early stages (version 0.0.1) with active development and testing.

## License
No specific license has been provided. Please contact the maintainers for further information. 