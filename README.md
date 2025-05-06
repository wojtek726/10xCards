# 10x Cards

## Project Description
10xCards is a web application that allows users to securely manage their accounts and access personalized flashcards. Users can register, log in, change their password, and delete their account. Each user has their individual set of flashcards that can be generated automatically using AI or created manually. The AI-powered flashcard generation helps users quickly create high-quality study materials from any text input.

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

## Project Structure
- `./src` - Source code
- `./src/layouts` - Astro layouts
- `./src/pages` - Astro pages
- `./src/pages/api` - API endpoints
- `./src/middleware/index.ts` - Astro middleware
- `./src/db` - Supabase clients and types
- `./src/types.ts` - Shared types for backend and frontend (Entities, DTOs)
- `./src/components` - Client-side components written in Astro (static) and React (dynamic)
- `./src/components/ui` - Client-side components from Shadcn/ui
- `./src/lib` - Services and helpers
- `./src/__tests__` - Component tests
- `./src/lib/services/__tests__` - Service tests
- `./src/pages/api/__tests__` - API endpoint tests
- `./e2e` - End-to-end tests
- `./tests` - Test utilities and examples

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
- `npm run dev:test` – Start the development server with host flag.
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
- `npm run test:e2e` – Run all end-to-end tests with Playwright.
- `npm run test:e2e:basic` – Run basic end-to-end tests.
- `npm run test:e2e:ci` – Run CI-specific end-to-end tests.
- `npm run test:e2e:smoke` – Run smoke tests.
- `npm run test:e2e:critical` – Run critical path tests.
- `npm run test:e2e:regression` – Run regression tests.
- `npm run test:e2e:ui` – Run Playwright tests with UI.
- `npm run test:e2e:debug` – Debug Playwright tests.
- `npm run test:e2e:visual` – Run visual tests.
- `npm run test:e2e:auth` – Run authentication tests.
- `npm run test:e2e:flashcards` – Run flashcard management tests.
- `npm run test:e2e:update-snapshots` – Update test snapshots.

## Testing Framework

### Unit Testing with Vitest
We use Vitest for unit and integration testing. Tests are located in the `__tests__` directories throughout the codebase, with the `.test.ts` or `.test.tsx` extension.

Key features:
- Fast test execution with watch mode
- UI interface for test exploration
- Coverage reporting
- Compatible with Jest API
- MSW (Mock Service Worker) for API mocking

### E2E Testing with Playwright
End-to-end tests use Playwright and follow the Page Object Model pattern. Tests are located in the `e2e` directory.

Key features:
- Chromium browser testing
- Screenshot and visual testing
- Trace viewer for debugging
- Page Object Model for maintainable tests
- Parallel test execution
- Project-based test organization (smoke, critical, regression)

Both testing frameworks follow the Arrange-Act-Assert pattern for clear and readable tests.

## Key Features
- **User Management:** Securely register, log in, change password, and delete account.
- **Flashcards:** Personal sets of flashcards unique to each user.
- **AI-Generated Flashcards:** Create flashcards automatically from any text input.
- **Manual Flashcard Creation:** Add, edit, and delete flashcards manually.
- **Flashcard Origin Tracking:** Track whether flashcards are AI-generated, AI-modified, or manually created.

## Project Status
Currently, the project is in active development with comprehensive test coverage to ensure functionality.

## License
No specific license has been provided. Please contact the maintainers for further information. 