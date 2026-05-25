# LedgerZero Project Instructions

This file contains the foundational mandates for development on the LedgerZero project.

## Local Documentation & Tracking

Every session or meaningful task MUST conclude with an update to the local project notes. These files are located in the `notes/` directory and are ignored by Git.

1.  **Read the Rules:** Before updating any notes, you MUST read `notes/rules.md` to ensure compliance with the established formatting and maintenance standards.
2.  **Update Progress:** Append every meaningful change to `notes/progress.md`. Follow the exact format specified in the rules (Newest at the BOTTOM).
3.  **Update Problems:** Maintain `notes/problems.md` as a live checklist of unresolved blockers. Remove items as soon as they are fixed.

## Tech Stack & Architecture

- **Frontend:** Next.js 16+ (App Router), Tailwind CSS 4, Framer Motion.
- **Backend/Auth:** Supabase (Database, Auth, SSR).
- **Design:** Liquid Glassmorphism, Deep Dark Mode (#050505), Apple-inspired minimalist aesthetics.
- **Middleware:** Standard Next.js middleware in `src/middleware.ts` for session management and routing protection.

## Routing Conventions

- `/`: Public landing page (no auth logic).
- `/login`: Public auth entry (Magic Links, OAuth).
- `/dashboard`: Protected internal workspace (Server-side auth check).
- `/api/auth/logout`: POST endpoint to terminate Supabase sessions.
