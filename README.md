# 10xCards

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

## Project Scope
- **User Management:** Securely register, log in, change password, and delete account.
- **Flashcards:** Personal sets of flashcards unique to each user.

## Project Status
Currently, the project is in its early stages (version 0.0.1) with active development and testing.

## License
No specific license has been provided. Please contact the maintainers for further information. 