import {
  BURPEE_VERSIONS,
  PULL_UP_VERSIONS,
  PUSH_UP_VERSIONS,
  SQUAT_VERSIONS,
  VUP_VERSIONS,
  COOPER_MULTIPLIERS,
  COOPER_MAX_SCORE
} from '@/services/exerciseVersions.js'

const VERSION_MAP = {
  pullup: PULL_UP_VERSIONS,
  pushup: PUSH_UP_VERSIONS,
  squats: SQUAT_VERSIONS,
  vups: VUP_VERSIONS,
  burpees: BURPEE_VERSIONS,
  cooper: [],
}

export function getExerciseKeys() {
  return Object.keys(VERSION_MAP)
}

export function getReps(t, key) {
  return t[key]?.reps ?? t[key] ?? null
}

export function getVersion(t, key) {
  const versions = VERSION_MAP[key]
  if (!versions?.length) return null
  return versions.find((v) => t[key]?.version === v.value) || null
}

export const EXERCISES = [
  { key: 'pullup', label: 'Pull Ups' },
  { key: 'pushup', label: 'Push Ups' },
  { key: 'squats', label: 'Squats' },
  { key: 'vups', label: 'V-Ups' },
  { key: 'burpees', label: 'Burpees' },
  { key: 'cooper', label: 'Cooper Laps' },
].map((e) => ({
  ...e,
  getReps: (t) => getReps(t, e.key),
  getVersion: (t) => getVersion(t, e.key),
  versions: VERSION_MAP[e.key],
}))

export function getExerciseType(key) {
  return EXERCISES.find((ex) => ex.key === key)
}

/**
 * Calculate points for an exercise entry using reps and optional version multiplier.
 * @param {number|string} reps - Number of repetitions (may be string)
 * @param {{multiplier:number}|null} version - Version object containing multiplier
 * @returns {number} Calculated points (reps * multiplier)
 */
export function calculatePoints(reps, version) {
  if (version === null) return reps

  const r = Number(reps) || 0
  const m = version && typeof version.multiplier === 'number' ? version.multiplier : 1
  return r * m
}

/**
 * Calculate Cooper test points based on laps completed and fitness level.
 * Returns 0 if no laps were recorded to avoid awarding points for non-participation.
 * @param {number|string} reps - Number of Cooper laps completed
 * @param {number} level - Cooper fitness level (1-5: very bad to very good)
 * @returns {number} Calculated Cooper points (0 if no laps recorded)
 */
export function calculateCooperPoints(reps, level) {
  if (!reps || reps <= 0) return 0
  return Math.round(COOPER_MAX_SCORE * COOPER_MULTIPLIERS[level] || 0)
}

/**
 * Calculate total score for a test including all exercises and Cooper test.
 * @param {Object} test - Test object containing exercise data
 * @param {number} cooperLevel - Cooper fitness level (1-5)
 * @returns {number} Total score
 */
export function calculateTotalScore(test, cooperLevel) {
  if (!test) return 0

  let totalScore = 0

  // Sum points from all exercises (excluding cooper)
  getExerciseKeys().forEach((key) => {
    if (key === 'cooper') return

    const version = getVersion(test, key)
    const reps = getReps(test, key)
    const points = calculatePoints(reps, version)
    // Only round points if there's a version (multiplier applied)
    const roundedPoints = version ? Math.round(points) : points
    totalScore += roundedPoints
  })

  // Add Cooper points
  const cooperReps = getReps(test, 'cooper')
  const cooperPoints = calculateCooperPoints(cooperReps, cooperLevel)
  totalScore += cooperPoints

  return totalScore
}
