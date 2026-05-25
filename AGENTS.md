# AGENTS.md

## Cursor Cloud specific instructions

This is a **single-service Next.js 16 (React 19)** application — no databases, Docker, or external services are needed.

### Running the application

- `npm run dev` — starts the dev server on `localhost:3000`
- `npm run build` — production build (Turbopack)
- `npm run lint` — ESLint (note: eslint is not in `devDependencies`; the script relies on `npx` auto-install)

### Key notes

- School data is statically bundled in `lib/schools-bundled.json`; no database or data-fetching step is required.
- The geocoding routes (`/api/onemap/search`, `/api/onemap/reverse`) require `GOOGLE_MAPS_SERVER_API_KEY` env var. Without it they return 500, but all other app features (school browsing, detail pages, comparison, favorites, guide) work fine.
- Both `package-lock.json` and `pnpm-lock.yaml` exist; prefer `npm install` to stay consistent with the lockfile used by Vercel deployments.
- The project uses Tailwind CSS v4 with `@tailwindcss/postcss` — styles are processed via PostCSS (see `postcss.config.mjs`).
- State (favorites, filters, home location) is persisted in localStorage via Zustand.
