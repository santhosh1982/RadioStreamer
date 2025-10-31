# RadioWave - AI-Powered Radio Streaming Platform

## Project Overview

RadioWave is a modern web radio streaming platform that enables users to discover, stream, and record radio stations globally. It features AI-powered search and recommendations, user authentication via Replit Auth, real-time streaming with WebSockets, and comprehensive radio station management. Users can create personalized favorites, record stations for offline playback, and interact with an AI assistant for intelligent recommendations.

**Key Technologies:**

*   **Frontend:** React 18 with TypeScript, Vite, shadcn/ui (Radix UI + Tailwind CSS), TanStack Query, Wouter.
*   **Backend:** Node.js with Express.js, Drizzle ORM, PostgreSQL (Neon serverless), Express sessions, Passport.js.
*   **AI:** OpenRouter API (GPT-4o).
*   **Authentication:** Replit Auth (OpenID Connect).

## Building and Running

This project uses `npm` for dependency management and script execution.

*   **Install Dependencies:**
    ```bash
    npm install
    ```

*   **Development Mode:**
    Runs the server in development mode with `tsx` and starts the client with Vite.
    ```bash
    npm run dev
    ```

*   **Build Project:**
    Builds the client-side assets with Vite and the server-side code with `esbuild`.
    ```bash
    npm run build
    ```

*   **Start Production Server:**
    Starts the compiled production server.
    ```bash
    npm run start
    ```

*   **Type Checking:**
    Runs TypeScript type checking across the project.
    ```bash
    npm run check
    ```

*   **Database Push:**
    Applies Drizzle ORM schema changes to the database.
    ```bash
    npm run db:push
    ```

## Development Conventions

*   **Language:** TypeScript is used for both frontend and backend development, ensuring type safety.
*   **UI Components:** `shadcn/ui` components, built on `Radix UI` primitives and styled with `Tailwind CSS`, are used for a consistent and accessible user interface.
*   **Database ORM:** `Drizzle ORM` is used for interacting with the PostgreSQL database, providing a type-safe and efficient way to manage data.
*   **Code Formatting/Linting:** (Implicit from `package.json` and `tsconfig.json` but not explicitly defined in `replit.md` - assume standard practices with Prettier/ESLint if not specified.)
