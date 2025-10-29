// Central list of version options per exercise type

function makeVersion(value, labelKey, multiplier = 1) {
  return { value, labelKey, multiplier };
}

export const PULL_UP_VERSIONS = [
  makeVersion("c", "exercise.pullup.complete"),
  makeVersion("n", "exercise.pullup.negative"),
  makeVersion("l", "exercise.pullup.bands"),
  makeVersion("m", "exercise.pullup.half"),
];

export const PUSH_UP_VERSIONS = [
  makeVersion("c", "exercise.pushup.complete"),
  makeVersion("m", "exercise.pushup.half"),
  makeVersion("r", "exercise.pushup.reverence"),
];

export const SQUAT_VERSIONS = [
  makeVersion("c", "exercise.squat.complete"),
];

export const VUP_VERSIONS = [
  makeVersion("c", "exercise.vup.complete"),
  makeVersion("m", "exercise.vup.half"),
];

export const BURPEE_VERSIONS = [
  makeVersion("c", "exercise.burpee.complete"),
  makeVersion("sf", "exercise.burpee.no_flex"),
];

export const EXERCISE_VERSIONS = {
  pullup: PULL_UP_VERSIONS,
  pushup: PUSH_UP_VERSIONS,
  squat: SQUAT_VERSIONS,
  vup: VUP_VERSIONS,
  burpee: BURPEE_VERSIONS,
};
