// Central list of version options per exercise type

function makeVersion(value, multiplier, labelKey) {
  return { value, labelKey, multiplier }
}

export const PULL_UP_VERSIONS = [
  makeVersion('c', 1, 'exercise.pullup.complete'),
  makeVersion('n', 0.7, 'exercise.pullup.negative'),
  makeVersion('l', 0.6, 'exercise.pullup.bands'),
  makeVersion('m', 0.5, 'exercise.pullup.half'),
]

export const PUSH_UP_VERSIONS = [
  makeVersion('c', 1, 'exercise.pushup.complete'),
  makeVersion('m', 0.5, 'exercise.pushup.half'),
  makeVersion('r', 0.3, 'exercise.pushup.reverence'),
]

export const SQUAT_VERSIONS = [makeVersion('c', 1, 'exercise.squat.complete')]

export const VUP_VERSIONS = [
  makeVersion('c', 1, 'exercise.vup.complete'),
  makeVersion('m', 0.5, 'exercise.vup.half'),
]

export const BURPEE_VERSIONS = [
  makeVersion('c', 1, 'exercise.burpee.complete'),
  makeVersion('sf', 0.7, 'exercise.burpee.no_flex'),
]

export const COOPER_MAX_SCORE = 50

export const COOPER_MULTIPLIERS = {
  5: 1,
  4: 0.8,
  3: 0.55,
  2: 0.4,
  1: 0.1,
}

export const EXERCISE_VERSIONS = {
  pullup: PULL_UP_VERSIONS,
  pushup: PUSH_UP_VERSIONS,
  squat: SQUAT_VERSIONS,
  vup: VUP_VERSIONS,
  burpee: BURPEE_VERSIONS,
}
