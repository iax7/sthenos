# Agent Instructions for Sthenos

Canonical guidance for any coding agent working in this repo (Copilot, Claude Code, Codex, …). `CLAUDE.md` imports this file — edit here, not there.

**All generated code and comments must be written in English.**

## Project Overview

- **Sthenos** is a Vue 3 + Vite SPA for tracking fitness profiles and exercise test entries. All data is stored in browser `localStorage`. There is no backend or API.
- The app is structured around a single profile object plus a test list, both managed by the `useProfileStore` Pinia store.
- Installable as a PWA (`vite-plugin-pwa`, `registerType: 'autoUpdate'`); `ReloadPrompt.vue` surfaces available updates.
- Deployed to GitHub Pages at `https://iax7.github.io/sthenos/` via `.github/workflows/deploy.yml`. Vite base path is `/sthenos/`. The `VITE_ABSOLUTE_URL` env variable holds the absolute URL for the live site.

## Architecture & Data Flow

- **Single source of truth:** All profile and test data is accessed via the `useProfileStore` Pinia store. Never mutate state directly.
- **Store** (`src/stores/`):
  - `useProfileStore.js`: `defineStore('userStore', ...)` in setup syntax. Reactive profile/test state with full CRUD, JSON import/export, remote import over HTTP, and localStorage persistence. Also exports the standalone helpers `createTestMetric`, `migrateProfile`, `normalizeProfile`, `todayISO`, and `ageAtDate(dob, testDate)`.
  - Profile and tests persist under **separate** keys (`user_profile_v1`, `user_tests_v1`), deliberately independent to ease a future Supabase migration. `profile_import_url` remembers the last remote import URL.
- **Composables** (`src/composables/`):
  - `useToasts.js`: Ephemeral toast notification system (`useToasts`, `toastError`).
- **Views** (`src/views/`):
  - `HomeView.vue`: Dashboard — summary, chart, last test overview.
  - `TestsView.vue`: Full test history table with delete support.
  - `ProfileView.vue`: Profile creation/edit.
  - `ExerciseEdit.vue`: Add or edit a test entry.
  - `ExerciseView.vue`: Read-only detail view for a single entry.
  - `SettingsView.vue` / `InfoView.vue`: App settings and info pages.
- **Components** (`src/components/`):
  - `TestTable.vue`: Test entries table with edit/delete (used in `TestsView`).
  - `HomeChart.vue` / `HomeChartStats.vue`: Chart.js metric chart and stats.
  - `HomeHeader.vue`: Dashboard header with profile summary.
  - `CooperLevelDot.vue`: Visual indicator for Cooper test fitness level.
  - `ExerciseForm.vue`: Shared form fields for exercise entries.
  - `AppNavbar.vue`, `AppVersion.vue`, `ReloadPrompt.vue`: Shell components.
  - UI primitives in `components/ui/`: `BaseButton`, `BaseInput`, `AppCard`, `AppFooter`, `ExerciseMetricInput`, `ToastContainer`, `ViewContainer`, `ConfirmModal`.
- **Services** (`src/services/`) — the scoring pipeline, layered bottom-up:
  - `exerciseVersions.js`: Version multipliers per exercise (e.g. pullup `n` = 0.7) plus `COOPER_MULTIPLIERS` / `COOPER_MAX_SCORE`.
  - `cooper.js`: `toMeters(laps)` (320 m per lap) and `evaluateCooper(meters, age, genderKey)` → fitness level 1–5, from age/gender range tables.
  - `exercises.js`: `EXERCISES` metadata, `getReps`/`getVersion`, `calculatePoints`, `calculateCooperPoints`, `calculateTotalScore`, and `getTestScore(test, profile)` — the entry point most callers want.
  - `exerciseCollectionService.js`: `filterTestsByMetric`, `filterTestsByTotalScore`, `calculateStats` — shapes `{date, value}` series for charts.
  - `chartColors.js`: Color palette for chart metrics.
  - `promptGenerator.js`: `generateLLMPrompt(profile, tests, locale)` — composes an external-LLM prompt; carries its own human-readable version labels because the app's own labels are i18n keys.
  - Scoring details worth knowing: points are rounded **only** when a version multiplier applies, and Cooper scores 0 when no laps were recorded (no points for non-participation).
- **Routing** (`src/router/index.js`): Hash-based routing (required for GitHub Pages). Only `HomeView` is eagerly imported; every other view is a lazy chunk.
  - Route guard redirects to `/profile` unless `meta.noProfile: true`.
  - Routes: `/` (dashboard), `/tests`, `/profile`, `/settings`, `/info`, `/exercise/new`, `/exercise/:index/edit`, `/exercise/:index`, plus a catch-all `/:pathMatch(.*)*` redirecting to `/`.

## Developer Workflows

```bash
pnpm install        # Install dependencies
pnpm dev            # Start Vite dev server with hot reload
pnpm build          # Production build (outputs to dist/)
pnpm preview        # Preview production build locally
pnpm lint           # ESLint with auto-fix
pnpm format         # Prettier formatting on src/
pnpm test           # Run Vitest unit tests
pnpm test:watch     # Vitest in watch mode
pnpm test:ui        # Vitest with browser UI
pnpm test:e2e       # Run Playwright e2e tests
pnpm test:e2e:ui    # Playwright with browser UI
pnpm test:e2e:headed  # Playwright in headed mode
```

Node version is pinned via `mise.toml` (Node 24). Package manager is pnpm.

**Unit tests** live in `src/tests/` (jsdom, setup in `src/tests/setup.js`); `tests/e2e/**` is excluded from Vitest.
**E2E tests** live in `tests/e2e/` (Playwright), run against two projects: `chromium` and `mobile` (Pixel 5). The dev server starts automatically.

Run a single test file or a single test:

```bash
pnpm vitest src/tests/useProfileStore.test.js
pnpm vitest -t "migrates legacy age"
pnpm playwright test tests/e2e/chart.spec.js --project=chromium
```

## Data Model

```js
// localStorage key: "user_profile_v1"
{
  name: String,
  gender: 'M' | 'F',
  dob: String,   // ISO date: 'YYYY-MM-DD' (replaces legacy `age` field; migrated on load)
  email: String, // optional
}

// localStorage key: "user_tests_v1"
[{ date: 'YYYY-MM-DD', pullup, pushup, squats, vups, burpees, cooper }]

// Each exercise (except cooper): { reps: Number, version: String }
// cooper: Number (laps; `toMeters` converts at 320 m per lap)
// `getReps` also tolerates a bare number per exercise, for backward compatibility.
```

## Patterns & Conventions

- **State access:** use `storeToRefs` for state and plain destructuring for actions:
  ```js
  import { storeToRefs } from 'pinia'
  import { useProfileStore } from '@/stores/useProfileStore.js'

  const store = useProfileStore()
  const { profile, tests, hasProfile } = storeToRefs(store)
  const { saveProfile, appendTest } = store
  ```
- **Import/Export:** Export triggers JSON download; import replaces profile+tests after validation. Import functions return result objects (`{ ok, error }` / `{ ok, profile, isOlder }`) instead of throwing — surface failures via toasts.
- **Clear:** Removes the stored profile and tests from localStorage and redirects to `/profile`.
- **Toasts:** `import { useToasts } from '@/composables/useToasts.js'` → `pushToast('message', 'success' | 'error')`.
- **i18n:** Auto-detects browser language (English/Spanish fallback). `$t('key')` in templates; `const { t } = useI18n()` in `<script setup>`. Translations: `src/locales/en.json`, `src/locales/es.json`.
- **Tailwind CSS:** Inline utility classes; minimal use of `@apply`.
- **Mutations:** Go through store actions; never assign to store state from a component.
- **Icons:** Use `@heroicons/vue/24/outline` (e.g., `import { ArrowLeftIcon } from '@heroicons/vue/24/outline'`).
- **Build-time globals:** `__BUILD_TIME__` and `__COMMIT_SHA__` are injected by `vite.config.js` (the latter from `git rev-parse`, falling back to `'unknown'`).

## Code Style

- Vue 3 SFCs with `<script setup>` only. No TypeScript — plain JavaScript (ESM), documented with JSDoc typedefs as the store and services do.
- `@` alias for `src/` imports. Named exports preferred; no default exports for stores, composables, or services.
- Prettier: `semi: false`, `singleQuote: true`, `printWidth: 100`, `tabWidth: 2`, `trailingComma: all`.
- Keep numeric fields as numbers; normalize string inputs before save.
- Guard clauses over nested conditionals; no throwing for user-facing errors — use toasts.

## Key Files

- `src/stores/useProfileStore.js`: Single source of truth
- `src/services/exercises.js`: Scoring entry point (`getTestScore`)
- `src/router/index.js`: All routes and navigation guard
- `src/locales/en.json` + `es.json`: i18n strings
- `src/App.vue`: Mounts global containers (ToastContainer, etc.)
- `src/main.js`: Registers Pinia, router, and i18n

---

For questions about conventions or missing documentation, check `README.md` and `CLAUDE.md`.
