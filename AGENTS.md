# Copilot Instructions for Sthenos

**All generated code and comments must be written in English.**

## Project Overview

- **Sthenos** is a Vue 3 + Vite SPA for tracking fitness profiles and exercise test entries. All data is stored in browser `localStorage` under the key `user_profile_v1`. There is no backend or API.
- The app is structured around a single profile object managed by the `useProfileStore` composable. All test entries are nested within this profile.
- Deployed to GitHub Pages at `https://iax7.github.io/sthenos/`. Vite base path is `/sthenos/`. The `VITE_ABSOLUTE_URL` env variable holds the absolute URL for the live site.

## Architecture & Data Flow

- **Single source of truth:** All profile and test data is accessed via the `useProfileStore` composable. Never mutate state directly.
- **Composables** (`src/composables/`):
  - `useProfileStore.js`: Reactive profile/test state with full CRUD, import/export, and localStorage persistence.
  - `useTimerEngine.js`: Timer state machine for exercise protocols (idle → prep → interval → rest → completed). Includes Wake Lock API integration.
  - `useTimerProtocols.js`: Loads pre-built protocols (Tabata, HIIT, Japanese Walking) from `src/data/default-protocols.js`.
  - `useToasts.js`: Ephemeral toast notification system.
- **Views** (`src/views/`):
  - `HomeView.vue`: Dashboard — summary, chart, test table.
  - `ProfileView.vue`: Profile creation/edit.
  - `ExerciseEdit.vue`: Add or edit a test entry.
  - `ExerciseView.vue`: Read-only detail view for a single entry.
  - `TimerList.vue` / `TimerRunner.vue`: Timer protocol list and active timer.
  - `SettingsView.vue` / `InfoView.vue`: App settings and info pages.
- **Components** (`src/components/`):
  - `HomeTable.vue`: Test entries table with edit/delete.
  - `HomeChart.vue` / `HomeChartStats.vue`: Chart.js metric chart and stats.
  - `ExerciseForm.vue`: Shared form fields for exercise entries.
  - `TimerCircle.vue` / `TimerProgressDots.vue`: Timer UI elements.
  - `AppNavbar.vue`, `AppVersion.vue`: Shell components.
  - UI primitives in `components/ui/`: `BaseButton`, `BaseInput`, `BaseNumberStepper`, `BaseSelect`, `AppCard`, `AppFooter`, `ExerciseCell`, `ExerciseMetricInput`, `ToastContainer`, `ViewContainer`.
- **Services** (`src/services/`):
  - `exercises.js`: Exercise metadata and point calculations.
  - `exerciseVersions.js`: Version multipliers (e.g., assisted vs strict).
  - `exerciseCollectionService.js`: Aggregation helpers for exercise collections.
  - `cooper.js`: Cooper test fitness level evaluation (1–5 scale).
  - `chartColors.js`: Color palette for chart metrics.
- **Routing** (`src/router.js`): Hash-based routing (required for GitHub Pages).
  - Route guard redirects to `/profile` unless `meta.noProfile: true`.
  - Routes: `/` (dashboard), `/profile`, `/settings`, `/info`, `/exercise/new`, `/exercise/:index/edit`, `/exercise/:index`, `/timer`, `/timer/:id/run`.

## Developer Workflows

```bash
npm install         # Install dependencies
npm run dev         # Start Vite dev server with hot reload
npm run build       # Production build (outputs to dist/)
npm run preview     # Preview production build locally
npm run lint        # ESLint with auto-fix
npm run format      # Prettier formatting on src/
npm run test        # Run Vitest unit tests
npm run test:watch  # Vitest in watch mode
npm run test:ui     # Vitest with browser UI
```

**Tests** live in `src/tests/`. Run a single test file: `npx vitest src/tests/useProfileStore.test.js`.

## Data Model

```js
// localStorage key: "user_profile_v1"
{
  name: String,
  gender: 'M' | 'F',
  age: Number,
  tests: [{ date: 'YYYY-MM-DD', pullup, pushup, squats, vups, burpees, cooper }]
}
// Each exercise (except cooper): { reps: Number, version: String }
// cooper: Number (distance/laps)
```

## Patterns & Conventions

- **State access:** `const { profile, tests, saveProfile } = useProfileStore()`
- **Import/Export:** Export triggers JSON download; import replaces profile+tests after validation.
- **Clear:** Removes `user_profile_v1` from localStorage and redirects to `/profile`.
- **Toasts:** `import { useToasts } from '@/composables/useToasts.js'` → `pushToast('message', 'success' | 'error')`.
- **i18n:** Auto-detects browser language (English/Spanish fallback). `$t('key')` in templates; `const { t } = useI18n()` in `<script setup>`. Translations: `src/locales/en.json`, `src/locales/es.json`.
- **Tailwind CSS:** Inline utility classes; minimal use of `@apply`.
- **Readonly state:** Composables expose `readonly(profile)` to prevent accidental mutations.

## Code Style

- Vue 3 SFCs with `<script setup>` only. No TypeScript — plain JavaScript (ESM).
- `@` alias for `src/` imports. Named exports preferred; no default exports for composables.
- Prettier: `semi: false`, `singleQuote: true`, `printWidth: 100`, `tabWidth: 2`, `trailingComma: all`.
- Keep numeric fields as numbers; normalize string inputs before save.
- Guard clauses over nested conditionals; no throwing for user-facing errors — use toasts.

## Key Files

- `src/composables/useProfileStore.js`: Single source of truth
- `src/router.js`: All routes and navigation guard
- `src/locales/en.json` + `es.json`: i18n strings
- `src/data/default-protocols.js`: Timer protocol definitions
- `src/App.vue`: Mounts global containers (ToastContainer, etc.)

---

For questions about conventions or missing documentation, check `README.md`.
