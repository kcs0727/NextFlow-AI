# EdgeAI - Rebuilt Full-Stack Next.js AI SaaS Application

EdgeAI is a unified full-stack SaaS platform providing advanced AI utilities for text generation, photo manipulation, vector synthesis, and resume analysis. This project is a complete migration of the old React + Express codebase into a high-performance, single-repo Next.js App Router workspace utilizing TypeScript, Prisma, PostgreSQL, Redis, Clerk, and Cloudinary.

## Key Features & Tech Stack

1. **Next.js App Router**: Optimized server rendering and backend route handlers colocated in a single codebase.
2. **TypeScript Everywhere**: Full typing guarantees across database models, backend APIs, state stores, and page views.
3. **Database (Prisma + PostgreSQL)**: High-performance data models for `User` and `Creation` featuring indexes, cascade deletes, and relational integrity.
4. **Zustand State Store**: Replaced React Context API completely with a clean, modular, and typed store at `src/store/useAppStore.ts`.
5. **Redis Caching & Protection Layer**:
   * **Dashboard Caching**: Caches user creation counts and history logs, invalidating immediately on new creations.
   * **Community Feed Caching**: Caches the public creations gallery feed, invalidating on new publishes or likes toggles.
   * **Usage Limits & Tracking**: Caches user free limits, protecting PostgreSQL database reads and syncing back increments.
   * **API Rate Limiter**: Implements minute-based rate limits (40 requests for premium, 5 requests for free) to protect endpoints.
   * **Graceful Fallback**: Automatically falls back to an In-Memory cache if `REDIS_URL` is unconfigured.
6. **Animated Landing Page**: Fully redesigned with responsive layouts, staggered entrance animations, and built-in theme switching (light/dark mode).
7. **Premium SaaS Operations**:
   * Cloudinary integration for generative background and object removal.
   * Clerk middleware auth guards and server-side authorization.
   * pdf-parse v2 integration for resume analysis.

---

## Getting Started

### 1. Setup Environment Variables

Copy the `.env.example` template into `.env` at the root of `/final_project`:

```bash
cp .env.example .env
```

Fill in the credentials:

*   **Clerk Key**: Create an app in [Clerk Console](https://clerk.com) and retrieve publishable and secret keys.
*   **Database URL**: Connection string for Neon PostgreSQL database.
*   **Redis URL**: Connection string for Redis or Upstash KV.
*   **Cloudinary Credentials**: `CLOUD_NAME`, `CLOUD_API`, and `CLOUD_SECRET`.
*   **Gemini API Key**: Google Generative AI key for Article and Title generators.
*   **Clipdrop API Key**: API key for image generation.

### 2. Install Dependencies

Install all node packages:

```bash
npm install
```

### 3. Setup Database (Prisma Migrations)

Apply migrations to compile schemas in PostgreSQL and generate the local Prisma Client:

```bash
npx prisma db push
npx prisma generate
```

### 4. Run Development Server

Launch the Next.js development server locally:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) on your browser.

### 5. Build for Production

Compile the optimized bundle:

```bash
npm run build
```

---

## Directory Structure

```text
/final_project
├── prisma/
│   └── schema.prisma        # Database models (User, Creation)
├── src/
│   ├── app/
│   │   ├── page.tsx         # Redesigned animated landing page
│   │   ├── ai/
│   │   │   ├── layout.tsx   # Dashboard Layout & Sidebar
│   │   │   ├── page.tsx     # Dashboard Analytics & Overview
│   │   │   ├── ...          # Tool Sub-Routes (write-article, generate-image, etc.)
│   │   ├── api/
│   │   │   └── ...          # AI & User backend route handlers
│   │   └── globals.css      # Theme variables and Tailwind directives
│   ├── assets/              # Local icons and static images
│   ├── components/          # Shared components (Creationitem)
│   ├── hooks/               # Custom React hooks (useTheme)
│   ├── lib/                 # Core server helpers (db, redis, rate-limit, auth-check)
│   ├── store/               # Zustand application store (useAppStore.ts)
│   └── middleware.ts        # Clerk path protection middleware
```
