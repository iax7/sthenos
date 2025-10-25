// exerciseVersions.js
// Central list of version options per exercise type

export const PULL_UP_VERSIONS = [
  {
    value: "c",
    labelKey: "exercise.pullup.complete",
    multiplier: 1,
  },
  {
    value: "n",
    labelKey: "exercise.pullup.negative",
    multiplier: 1,
  },
  {
    value: "l",
    labelKey: "exercise.pullup.bands",
    multiplier: 1,
  },
  {
    value: "m",
    labelKey: "exercise.pullup.half",
    multiplier: 1,
  },
];

export const PUSH_UP_VERSIONS = [
  {
    value: "c",
    labelKey: "exercise.pushup.complete",
    multiplier: 1,
  },
  {
    value: "m",
    labelKey: "exercise.pushup.half",
    multiplier: 1,
  },
  {
    value: "r",
    labelKey: "exercise.pushup.reverence",
    multiplier: 1,
  },
];

export const SQUAT_VERSIONS = [
  {
    value: "c",
    labelKey: "exercise.squat.complete",
    multiplier: 1,
  },
];

export const VUP_VERSIONS = [
  {
    value: "c",
    labelKey: "exercise.vup.complete",
    multiplier: 1,
  },
  { value: "m", labelKey: "exercise.vup.half", multiplier: 1 },
];

export const BURPEE_VERSIONS = [
  {
    value: "c",
    labelKey: "exercise.burpee.complete",
    multiplier: 1,
  },
  {
    value: "sf",
    labelKey: "exercise.burpee.no_flex",
    multiplier: 1,
  },
];
