# REST API Plan

## 1. Resources

- **Users** (table: users):
  - Fields: `id` (UUID, primary key), `login` (unique, VARCHAR(32)), `hash_password` (VARCHAR(255)), `created_at`, `updated_at`.
  - Indexes: Unique index on `login`.

- **Flashcards** (table: flashcards):
  - Fields: `id` (UUID, primary key), `user_id` (UUID, foreign key referencing users with ON DELETE CASCADE), `front` (VARCHAR(200)), `back` (VARCHAR(500)), `card_origin` (ENUM: 'manual', 'ai', 'ai_modified'), `created_at`, `updated_at`.
  - Relationships: One-to-many relationship (each user can have many flashcards).
  - Indexes: Index on `user_id`.
  - Security: Row Level Security enabled with policy using session parameter (current_setting('app.current_user_id')).

## 2. Endpoints

### A. Authentication & User Management

1. **POST /auth/register**
   - **Description:** Register a new user account.
   - **Request Body:**
     ```json
     {
       "login": "string",
       "password": "string"
     }
     ```
   - **Response:**
     ```json
     {
       "user": { "id": "uuid", "login": "string", "created_at": "timestamp" },
       "token": "JWT token string"
     }
     ```
   - **Errors:** 400 (bad request), 409 (login already exists).

2. **POST /auth/login**
   - **Description:** Authenticate user and issue a JWT token.
   - **Request Body:**
     ```json
     {
       "login": "string",
       "password": "string"
     }
     ```
   - **Response:**
     ```json
     {
       "user": { "id": "uuid", "login": "string" },
       "token": "JWT token string"
     }
     ```
   - **Errors:** 400 (bad request), 401 (invalid credentials).

3. **PUT /auth/password**
   - **Description:** Change user password.
   - **Request Body:**
     ```json
     {
       "current_password": "string",
       "new_password": "string"
     }
     ```
   - **Response:**
     ```json
     { "success": true }
     ```
   - **Errors:** 400 (invalid input), 401 (unauthorized).

4. **DELETE /auth/account**
   - **Description:** Delete the user account.
   - **Response:**
     ```json
     { "success": true }
     ```
   - **Errors:** 401 (unauthorized), 404 (account not found).

### B. Flashcards

1. **GET /flashcards**
   - **Description:** Retrieve a paginated list of flashcards belonging to the authenticated user.
   - **Query Parameters:**
     - `page` (optional, default: 1)
     - `limit` (optional, default: 10)
     - `card_origin` (optional filter, e.g., 'manual', 'ai', 'ai_modified')
   - **Response:**
     ```json
     {
       "flashcards": [
         { "id": "uuid", "front": "string", "back": "string", "card_origin": "string", "created_at": "timestamp" }
         // ... more flashcards
       ],
       "pagination": { "total": 100, "page": 1, "limit": 10 }
     }
     ```
   - **Errors:** 401 (unauthorized).

2. **GET /flashcards/{id}**
   - **Description:** Retrieve details for a specific flashcard.
   - **Response:**
     ```json
     {
       "id": "uuid",
       "front": "string",
       "back": "string",
       "card_origin": "string",
       "created_at": "timestamp"
     }
     ```
   - **Errors:** 401 (unauthorized), 404 (not found).

3. **POST /flashcards**
   - **Description:** Create a new flashcard manually (also used to accept an AI-generated flashcard).
   - **Request Body:**
     - For manual creation:
       ```json
       {
         "front": "string",
         "back": "string",
         "card_origin": "manual"
       }
       ```
     - For accepting an AI-generated flashcard, the client submits the generated content with an appropriate `card_origin` (either 'ai' or 'ai_modified').
   - **Response:**
     ```json
     {
       "id": "uuid",
       "front": "string",
       "back": "string",
       "card_origin": "string",
       "created_at": "timestamp",
       "updated_at": "timestamp"
     }
     ```
   - **Errors:** 400 (validation errors), 401 (unauthorized).

4. **PUT /flashcards/{id}**
   - **Description:** Update an existing flashcard. Only allowed if the flashcard belongs to the authenticated user.
   - **Request Body:**
     ```json
     {
       "front": "string (optional)",
       "back": "string (optional)"
     }
     ```
   - **Response:**
     ```json
     {
       "id": "uuid",
       "front": "string",
       "back": "string",
       "card_origin": "string",
       "updated_at": "timestamp"
     }
     ```
   - **Errors:** 400, 401, 404.

5. **DELETE /flashcards/{id}**
   - **Description:** Delete a flashcard.
   - **Response:**
     ```json
     { "success": true }
     ```
   - **Errors:** 401, 404.

6. **POST /flashcards/generate**
   - **Description:** Generate a flashcard using AI from provided text input. The flashcard is only a suggestion until the user accepts it.
   - **Request Body:**
     ```json
     {
       "input_text": "string"
     }
     ```
   - **Response:**
     ```json
     {
       "suggested_flashcard": {
         "front": "string",
         "back": "string",
         "suggested_card_origin": "ai"
       }
     }
     ```
   - **Errors:** 400 (if input text is invalid), 401 (unauthorized).

*Note:* The client must call **POST /flashcards** to persist an accepted AI-generated flashcard.

## 3. Authentication and Authorization

- **Mechanism:** JWT-based authentication. Upon successful login or registration, a JWT token is issued and used to authenticate subsequent requests (included in the HTTP `Authorization` header as a Bearer token).
- **Implementation:**
  - Leverage Supabase Authentication capabilities, with tokens and middleware to set the session parameter `app.current_user_id` for enforcing RLS.
  - All flashcards endpoints require an authenticated user and validate that the flashcard's `user_id` matches the current user.
- **Security Measures:**
  - Rate limiting on sensitive endpoints (e.g., login, flashcards/generate) to prevent abuse.
  - Secure password storage with proper hashing (e.g., using pgcrypto in PostgreSQL).

## 4. Validation and Business Logic

- **Database Validations:**
  - Unique constraint on `users.login`.
  - Field length constraints on `login`, `front`, and `back` are enforced by the database schema (VARCHAR limits).
  - Timestamps (`created_at`, `updated_at`) are automatically populated.
  - `card_origin` must be one of the defined ENUM values: 'manual', 'ai', 'ai_modified'.

- **Business Logic Requirements (from PRD):**
  1. **AI Flashcard Generation (US-001):**
     - Validate input text and generate a flashcard suggestion with scientifically accurate content.
     - The flashcard is not persisted until the user explicitly accepts it by calling the manual creation endpoint with the generated data.
     - *Design Decision:* Separate endpoint (`POST /flashcards/generate`) is used for generation, with acceptance handled via `POST /flashcards`.

  2. **Manual Flashcard Creation (US-002):**
     - Allows users to create flashcards with custom `front` and `back` content.
     - Input validation ensures data length and presence of required fields.

  3. **User Account Management (US-003):**
     - Endpoints for registration, login, password update, and account deletion are provided.

  4. **Integration with Repetition Algorithm (US-004):**
     - After a flashcard is accepted and saved, a background process or webhook can trigger integration with a repetition scheduling module.

  5. **Activity Logging (US-005):**
     - Actions such as flashcard creation, acceptance, editing, and deletion are logged with timestamps.
     - These logs can be used for analytics and user activity monitoring.

  6. **Flashcard Rejection (US-006):**
     - If a generated flashcard is rejected by the user, it is not persisted or stored.

- **Error Handling:**
  - Return clear and consistent error messages with appropriate HTTP status codes:
    - 400 for validation errors and bad requests.
    - 401 for unauthorized access.
    - 404 when a resource is not found.
    - 500 for unexpected server errors.

- **Row-Level Security:**
  - The flashcards table uses RLS policies to restrict access so that users can only operate on their own flashcards. This is enforced both at the database layer and in the API logic.

---

This API plan aligns with the provided database schema, product requirements, and technology stack (Astro, React, TypeScript, Tailwind, Shadcn/ui, and Supabase). The design emphasizes security, clarity, and scalability of endpoints while ensuring that business logic and validations are properly enforced. 