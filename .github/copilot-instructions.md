# Copilot Instructions for Sthenos

**All generated code and comments must be written in English.**

## Project Overview

- **Sthenos** is a Vue 3 + Vite SPA for tracking fitness profiles and exercise test entries. All data is stored in browser `localStorage` under the key `user_profile_v1`.
- The app is structured around a single profile object managed by the `useProfileStore` composable. All test entries are nested within this profile.

## Architecture & Data Flow

- **Single source of truth:** All profile and test data is accessed via the `useProfileStore` composable. Never mutate state directly.
- **Composables:**
  - `useProfileStore.js`: Reactive profile/test state with CRUD operations
  - `useToasts.js`: Toast notification system
- **Components:**
  - `Dashboard.vue`: Main view, shows summary, table, chart.
  - `ProfileForm.vue`: Profile creation/edit.
  - `DashboardTable.vue`: Test entries table with edit/delete.
  - `ExerciseEditor.vue`: Wrapper for new/edit test entry.
  - `DashboardChart.vue`: SVG chart for metrics.
  - UI primitives in `components/ui/` (e.g., `BaseButton`, `BaseInput`).
- **Routing:**
  - Route guard redirects to `/profile` if no profile exists.
  - Key routes: `/` (dashboard), `/profile`, `/exercise/new`, `/exercise/edit/:index`.

## Developer Workflows

- **Dev server:**
  - `npm install`
  - `npm run dev`
- **Build:**
  - `npm run build`
- **Preview:**
  - `npm run preview`
- **No formal test suite** (as of README); manual testing via UI.

## Patterns & Conventions

- **Composables (Recommended):**
  - Use `useProfileStore` for reactive state access: `const { profile, tests, saveProfile } = useProfileStore()`
- **Import/Export:**
  - Export triggers JSON download of profile.
  - Import replaces profile/tests after validation.
- **Clear:**
  - Removes `user_profile_v1` from `localStorage` and redirects to `/profile`.
- **Toast notifications:**
  - Use `useToasts.js` composable and `ToastContainer.vue` for ephemeral messages.
  - Example: `pushToast('Profile saved', 'success')`.
- **i18n:**
  - Use `useI18n()` composable for translations
  - In templates: use `$t()` directly
  - In script: destructure `t` from `useI18n()`
- **Tailwind CSS:** Inline utility classes; some use of `@apply`.

## Deprecated Code

- Legacy files (`ExercisesScreen.vue`, `ExercisesTable.vue`, `exerciseStore.js`) are empty and safe to delete. Not referenced anywhere.

## External Dependencies

- Vue 3, Vite, Tailwind CSS. No backend/API integration; all data is local.

## Examples

- To add a toast: `import { useToasts } from '@/composables/useToasts.js'`
- To update profile/tests: Use methods from `useProfileStore`, not direct mutation.

## Key Files

- `src/composables/useProfileStore.js`: Data model and store helpers
- `src/components/`: Main UI components
- `src/composables/useToasts.js`: Toast logic
- `src/App.vue`: Mounts global containers

---

For questions about conventions or missing documentation, check `README.md` or ask for clarification. Remove deprecated files when possible.
