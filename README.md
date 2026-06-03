# Sthenos – Personal Fitness Tracker

[Live Site](https://iax7.github.io/sthenos/)

Sthenos is a lightweight single-page app for tracking a fitness profile (name, gender, date of birth) and a series of exercise test entries (pull-ups, push-ups, squats, v-ups, burpees, Cooper laps). All data is stored locally in the browser via `localStorage` under a single key.

## Technology

- Vue 3 with `<script setup>` SFCs
- Vite bundler
- Tailwind utility classes

## Data Model

Profile data is accessed via the `useProfileStore` composable:

```js
{
  name: String,
  gender: 'M' | 'F',
  dob: String,     // ISO date: 'YYYY-MM-DD' (replaces legacy `age` field; migrated on load)
  email: String,   // optional
  tests: [
    {
      date: 'YYYY-MM-DD',
      pullup: { reps: Number, version: String },
      pushup: { reps: Number, version: String },
      squats: { reps: Number, version: String },
      vups: { reps: Number, version: String },
      burpees: { reps: Number, version: String },
      cooper: Number,
    },
  ],
}
```

## Development

```bash
pnpm install
pnpm dev
pnpm build
```
