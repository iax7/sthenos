import { BURPEE_VERSIONS, PULL_UP_VERSIONS, PUSH_UP_VERSIONS, SQUAT_VERSIONS, VUP_VERSIONS } from "@/services/exerciseVersions.js";

const VERSION_MAP = {
  pullup: PULL_UP_VERSIONS,
  pushup: PUSH_UP_VERSIONS,
  squats: SQUAT_VERSIONS,
  vups: VUP_VERSIONS,
  burpees: BURPEE_VERSIONS,
  cooper: []
};

function getReps(t, key) {
  return t[key]?.reps ?? t[key] ?? null;
}

function getVersion(t, key) {
  const versions = VERSION_MAP[key];
  if (!versions?.length) return null;
  return versions.find(v => t[key]?.version === v.value) || null;
}

export const EXERCISES = [
  { key: "pullup", label: "Pull Ups" },
  { key: "pushup", label: "Push Ups" },
  { key: "squats", label: "Squats" },
  { key: "vups", label: "V-Ups" },
  { key: "burpees", label: "Burpees" },
  { key: "cooper", label: "Cooper Laps" }
].map(e => ({
  ...e,
  getReps: (t) => getReps(t, e.key),
  getVersion: (t) => getVersion(t, e.key),
  versions: VERSION_MAP[e.key]
}));

export function getExerciseType(key) {
  return EXERCISES.find((ex) => ex.key === key);
}
