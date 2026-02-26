# AGENTS.md

This file guides agentic coding tools working in this repository. Follow it alongside
`/Users/ipina/projects/sthenos/CLAUDE.md` and the Copilot instructions in
`.github/copilot-instructions.md`.

## Build, Lint, Test

Project uses Vite + Vue 3. There is no automated test suite; validation is manual.

Common commands (from `package.json`):

- Install: `npm install`
- Dev server: `npm run dev`
- Build: `npm run build`
- Preview build: `npm run preview`
- Lint (auto-fix): `npm run lint`
- Format: `npm run format`

Single-test guidance:

- No unit/integration test runner is configured.
- Manual testing is required via the UI. Focus on the impacted routes/components.
- If you add a test runner later, document a single-test command here.

## Source of Truth and Data Flow

- All data is stored in browser `localStorage` under the key `user_profile_v1`.
- There is no backend or API; avoid assumptions about server calls.
- Single source of truth: `useProfileStore` in `src/composables/useProfileStore.js`.
- Never mutate profile/tests directly; always call store methods.

## Code Style and Conventions

### Language, Comments, and Strings

- All code and comments must be written in English.
- Use i18n keys for UI text, not hard-coded strings.
- Use `$t('key')` in templates and `const { t } = useI18n()` in `<script setup>`.

### Vue and Component Structure

- Use Vue 3 SFCs with `<script setup>` only.
- Components are PascalCase and live in `src/components/`.
- UI primitives are in `src/components/ui/` (BaseButton, BaseInput, etc.).
- Prefer composing with UI primitives before adding new base components.

### Imports and Module Paths

- Prefer the `@` alias for `src/` imports (configured in `vite.config.js`).
- Keep import groups ordered: node/built-ins, external packages, internal aliases.
- Use named exports where practical; avoid default exports for composables.
- Co-locate related imports; remove unused imports before commit.

### Formatting

Prettier config in `.prettierrc.json`:

- `semi: false`
- `singleQuote: true`
- `printWidth: 100`
- `tabWidth: 2`
- `trailingComma: all`

Run `npm run format` for formatting, `npm run lint` for ESLint with auto-fix.

ESLint config highlights in `eslint.config.js`:

- Flat config with `@eslint/js` recommended rules.
- `eslint-plugin-vue` flat essential rules.
- `@vue/eslint-config-prettier/skip-formatting` to defer formatting to Prettier.
- Globals include browser APIs; ignored paths include `dist`, `dist-ssr`, `coverage`, `public`.

### Types and Data Shapes

- Codebase is JavaScript (ESM); no TypeScript.
- Keep data shapes consistent with the profile model:
  - `profile: { name, gender, age, tests }`
  - `tests: [{ date, pullup, pushup, squats, vups, burpees, cooper }]`
  - Each exercise: `{ reps: Number, version: String }`
- Prefer explicit object shapes and validation on imports.
- Keep numeric fields as numbers; normalize string inputs before save.

### Naming and File Conventions

- Composables must be named `useX` and return reactive state + methods.
- Routes and components should use existing naming conventions from `src/router.js`.
- Avoid new global state; keep state localized to composables.
- Place shared logic in `src/composables/` rather than component methods.

### Error Handling and UX

- Use `useToasts` to surface user-facing success/error messages.
- For operations that touch `localStorage`, handle failures defensively.
- Prefer small, explicit guard clauses to avoid undefined/null states.
- Avoid throwing for user-facing errors; show a toast and recover gracefully.

### Styling

- Use Tailwind utility classes; minimal custom CSS.
- Keep class lists readable; refactor to components or `@apply` only if needed.
- Prefer existing color tokens and spacing utilities for consistency.

## Architecture Notes (from repo docs)

- `useProfileStore` manages CRUD, import/export, and localStorage persistence.
- `useTimerEngine` is a state machine for exercise protocols.
- `useTimerProtocols` loads defaults from `src/data/default-protocols.js`.
- `useToasts` provides ephemeral notifications.
- Routing is hash-based; guard redirects to `/profile` when no profile exists.
- Vite base path is `/sthenos/` for GitHub Pages.
- `VITE_ABSOLUTE_URL` env var holds the live site URL.

## Cursor and Copilot Rules

- No Cursor rules found in `.cursor/rules/` or `.cursorrules`.
- Copilot instructions live in `.github/copilot-instructions.md` and must be followed.
- Key Copilot rules:
  - All generated code and comments must be written in English.
  - Do not mutate state directly; always use `useProfileStore` methods.
  - Use the toast system (`useToasts`) for user feedback.
  - Use i18n for text (`$t` in templates, `useI18n` in script).
  - Legacy files (`ExercisesScreen.vue`, `ExercisesTable.vue`, `exerciseStore.js`) are
    empty and safe to delete.

## Repo-Specific Details

- i18n files: `src/locales/en.json`, `src/locales/es.json`.
- Chart logic uses `chart.js` and `vue-chartjs`; styling uses Tailwind.
- Key routes: `/` (dashboard), `/profile`, `/exercise/new`, `/exercise/edit/:index`.

## Suggested Manual Test Checklist

- Profile create/edit and persistence across refresh.
- Add/edit/delete an exercise test entry.
- Import/export profile JSON.
- Chart rendering and metric selection.
- Route guard redirect to `/profile` when no profile exists.

## If You Add Tooling

- Prefer repository-wide defaults; document any new scripts in this file.
- If you introduce tests, add a “single test” command section here.
