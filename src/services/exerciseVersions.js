// Central list of version options per exercise type

function makeVersion(value, multiplier, labelKey) {
  return { value, labelKey, multiplier };
}

export const PULL_UP_VERSIONS = [
  makeVersion("c", 1, "exercise.pullup.complete"),
  makeVersion("n", 1, "exercise.pullup.negative"),
  makeVersion("l", 1, "exercise.pullup.bands"),
  makeVersion("m", 1, "exercise.pullup.half"),
];

export const PUSH_UP_VERSIONS = [
  makeVersion("c", 1, "exercise.pushup.complete"),
  makeVersion("m", 1, "exercise.pushup.half"),
  makeVersion("r", 1, "exercise.pushup.reverence"),
];

export const SQUAT_VERSIONS = [
  makeVersion("c", 1, "exercise.squat.complete"),
];

export const VUP_VERSIONS = [
  makeVersion("c", 1, "exercise.vup.complete"),
  makeVersion("m", 1, "exercise.vup.half"),
];

export const BURPEE_VERSIONS = [
  makeVersion("c", 1, "exercise.burpee.complete"),
  makeVersion("sf", 1, "exercise.burpee.no_flex"),
];

export const EXERCISE_VERSIONS = {
  pullup: PULL_UP_VERSIONS,
  pushup: PUSH_UP_VERSIONS,
  squat: SQUAT_VERSIONS,
  vup: VUP_VERSIONS,
  burpee: BURPEE_VERSIONS,
};
