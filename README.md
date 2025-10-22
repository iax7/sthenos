# Sthenos – Personal Fitness Tracker

[Live Site](https://iax7.github.io/sthenos/)

Sthenos is a lightweight single-page app for tracking a fitness profile (name, gender, age) and a series of exercise test entries (pull-ups, push-ups, squats, v-ups, burpees, Cooper laps). All data is stored locally in the browser via `localStorage` under a single key.

## Core Features

* Create / edit a profile
* Add, edit, delete exercise test entries
* Persistent storage in `localStorage` (`user_profile_v1`)
* Import (upload JSON) / export (download JSON)
* Clear all data with confirmation
* Simple trend chart for any metric
* Route guard: if no profile, you are redirected to profile creation

## Technology

* Vue 3 with `<script setup>` SFCs
* Vite bundler
* Tailwind utility classes (inline; some `@apply` usage may require Tailwind build processing)
* Minimal custom UI primitives (`BaseButton`, `BaseInput`, `BaseNumberStepper`, `Card`, `BaseSelect`)

## Data Model

`profileStore.js` manages a single profile object:

```js
{
  name: String,
  gender: 'M' | 'F',
  age: Number,
  tests: [
    {
      date: 'YYYY-MM-DD',
      pullUps, pullUpsVersion,
      pushUps, pushUpsVersion,
      squats, squatsVersion,
      vups, vupsVersion,
      burpees, burpeesVersion,
      laps
    }
  ]
}
```

Store helpers cover: load, save (merging existing tests), append, update, delete, import/validate.

## Routing

| Path | Name | Component | Notes |
|------|------|-----------|-------|
| `/` | `dashboard` | `Dashboard.vue` | Shows profile summary, tests table, chart |
| `/profile` | `profile` | `ProfileForm.vue` | Create / edit profile |
| `/exercise/new` | `exercise-new` | `ExerciseEditor.vue` | New test entry |
| `/exercise/edit/:index` | `exercise-edit` | `ExerciseEditor.vue` | Edit existing test |
| `/dashboard` | (redirect) | – | Alias redirect to `/` |

Navigation Guard: Accessing dashboard or exercise routes without a stored profile redirects to `/profile`.

## Active Components Overview

* `Dashboard.vue` – Main view; links to edit profile and new test entry.
* `ProfileForm.vue` – Profile creation/edit; preserves existing `tests` when editing.
* `DashboardTable.vue` – Displays tests with edit/delete actions.
* `ExerciseEditor.vue` – Wrapper deciding between new vs edit form.
* `ExerciseForm.vue` / `ExerciseEditForm.vue` – Create or modify a test entry.
* `ExerciseMetricInput.vue` – Reusable metric + version pair input.
* `DashboardChart.vue` – SVG trend chart (line, area, markers) for selected metric.
* UI components under `components/ui/` – Low-level building blocks.
* `Navbar.vue` – Global actions (import/export/clear) and branding.

## Removed / Deprecated Code

Legacy artifacts no longer used after consolidation into the single profile store:

* `ExercisesScreen.vue` – Old aggregated screen (now redundant).
* `ExercisesTable.vue` – Old table relying on a separate exercise store.
* `exerciseStore.js` – Standalone store for `exercise_records_v1`.

Physical deletion is currently constrained in the environment; as a workaround the files have been reduced to empty content (logical removal). They are safe to delete outright when possible—they are not imported or referenced.

## Import / Export Profile

Export: Triggers a JSON download of the current profile object.

Import: Upload a previously exported JSON; validation ensures structure consistency. Existing tests are replaced only when explicitly provided in the imported JSON.

## Clearing Data

Clear action removes the `user_profile_v1` key from `localStorage`. App will redirect you to `/profile` on next guarded navigation.

## Development

Install dependencies and run dev server:

```bash
npm install
npm run dev
```

Build production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Architectural Notes

* Single source of truth: `profileStore.js`
* Tests are always manipulated via store helpers (never mutate raw array directly in components)
* Save logic merges existing tests when updating profile metadata to prevent accidental loss
* Chart recalculates derived paths from `tests` each render – small dataset approach (optimization not currently necessary)

## Toast Notifications

Global, ephemeral notifications are provided by a lightweight composable + container:

* `useToasts.js` – exposes `toasts`, `pushToast(message, variant='success', ttl=3000)`, and `removeToast(id)`.
* `ToastContainer.vue` – mounted once in `App.vue`; renders current toasts.

Usage inside any component:

```js
import { useToasts } from '../composables/useToasts.js'
const { pushToast } = useToasts()
pushToast('Profile saved', 'success')
pushToast('Something went wrong', 'error', 5000)
```

Variants supported out of the box: `success`, `error`. TTL (milliseconds) can be set per toast; pass a falsy value to keep it until manually closed.

Extending styles: adjust classes in `ToastContainer.vue`. Add more variants by checking `t.variant` and mapping to new Tailwind utility strings.

## Roadmap Ideas

* Change detection: disable Save if no edits
* Toast when redirect occurs due to missing profile
* Metrics filtering / grouping (e.g. average per week)
* Dark mode toggle

## Bilingual Summary (EN / ES)

EN: Sthenos tracks a fitness profile and test entries locally. You can add, edit, import, export, visualize trends, and clear all data safely. Unused legacy components were deprecated to simplify maintenance.

ES: Sthenos registra tu perfil y pruebas de ejercicio localmente. Puedes crear/editar el perfil, agregar/modificar pruebas, importar/exportar datos, ver tendencias y limpiar todo. Componentes antiguos fueron marcados como obsoletos para mantener el código simple.

---

Feel free to remove the deprecated files physically once the environment permits. For any enhancements, open an issue or extend the roadmap list above.
