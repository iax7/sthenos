# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server with hot reload
npm run build     # Production build (outputs to dist/)
npm run preview   # Preview production build locally
npm run lint      # ESLint with auto-fix
npm run format    # Prettier formatting on src/
```

There is no test suite — testing is done manually via the UI.

## Architecture

**Sthenos** is a Vue 3 + Vite SPA for tracking fitness profiles and exercise tests. All data is stored in `localStorage` under the key `user_profile_v1`. There is no backend or API.

### State Management

All state flows through composables, not a global store:

- **`useProfileStore`** (`src/composables/useProfileStore.js`) — Single source of truth. Manages the reactive `profile` object (which contains nested `tests` array) with full CRUD, import/export, and localStorage persistence. Always use its methods; never mutate state directly.
- **`useTimerEngine`** (`src/composables/useTimerEngine.js`) — Timer state machine for exercise protocols (states: idle → prep → interval → rest → completed). Includes Wake Lock API integration.
- **`useTimerProtocols`** (`src/composables/useTimerProtocols.js`) — Loads pre-built protocols (Tabata, HIIT, Japanese Walking) from `src/data/default-protocols.js`.
- **`useToasts`** (`src/composables/useToasts.js`) — Ephemeral notifications. Usage: `pushToast('message', 'success' | 'error')`.

### Data Model

```js
{
  name: String,
  gender: 'M' | 'F',
  age: Number,
  tests: [{ date: 'YYYY-MM-DD', pullup, pushup, squats, vups, burpees, cooper }]
}
// Each exercise: { reps: Number, version: String }
// cooper: Number (distance/laps)
```

### Routing

Hash-based routing (required for GitHub Pages). A route guard in `src/router.js` redirects to `/profile` if no profile exists. Routes can bypass it with `meta: { noProfile: true }`.

Key routes: `/` (dashboard), `/profile`, `/exercise/new`, `/exercise/:index/edit`, `/exercise/:index`, `/timer`, `/timer/:id/run`.

### Services

Business logic lives in `src/services/`:
- `exercises.js` — Exercise metadata and point calculations
- `exerciseVersions.js` — Version multipliers (e.g., assisted vs strict)
- `cooper.js` — Cooper test fitness level evaluation (1–5 scale)
- `chartColors.js` — Color palette for chart metrics

### i18n

Auto-detects browser language (English/Spanish fallback). In templates: `$t('key')`. In `<script setup>`: `const { t } = useI18n()`. Translations live in `src/locales/en.json` and `src/locales/es.json`.

## Conventions

- All code and comments must be written in **English**.
- Use `<script setup>` syntax for all Vue components.
- Use the `@` path alias for `src/` imports.
- Tailwind utility classes for styling; minimal custom CSS.
- Expose readonly reactive state from composables (`readonly(profile)`) to prevent accidental mutations.
- Use `useProfileStore` methods for any profile/test changes — not direct object mutation.

## Deployment

Deployed to GitHub Pages at `https://iax7.github.io/sthenos/`. The Vite base path is `/sthenos/`. The `VITE_ABSOLUTE_URL` env variable holds the absolute URL for the live site.
