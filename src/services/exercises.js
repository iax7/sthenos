import {
  BURPEE_VERSIONS,
  PULL_UP_VERSIONS,
  PUSH_UP_VERSIONS,
  SQUAT_VERSIONS,
  VUP_VERSIONS,
  COOPER_MULTIPLIERS,
  COOPER_MAX_SCORE,
} from '@/services/exerciseVersions.js'
import { toMeters, evaluateCooper } from '@/services/cooper.js'
import { ageAtDate } from '@/stores/useProfileStore.js'

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

/**
 * Compute the Cooper fitness level (1-5) for a test, from its laps and the
 * profile's age/gender bands. Returns null when there are no laps or the data
 * is missing. This is the single source of truth for the Cooper derivation.
 * @param {Object} test - Test object containing a cooper lap count and date.
 * @param {Object} profile - User profile with dob and gender.
 * @returns {number|null} Cooper fitness level 1-5, or null.
 */
export function getCooperLevel(test, profile) {
  if (!test || !profile) return null
  if (!test.cooper || test.cooper <= 0) return null
  const genderKey = profile.gender?.toLowerCase() || 'm'
  const age = ageAtDate(profile.dob, test.date)
  const meters = toMeters(test.cooper || 0)
  return evaluateCooper(meters, age, genderKey)
}

/**
 * Calculate total score for a test given a profile (handles Cooper level calculation).
 * @param {Object} test - Test object containing exercise data
 * @param {Object} profile - User profile with dob and gender
 * @returns {number} Total score
 */
export function getTestScore(test, profile) {
  if (!test || !profile) return 0
  const level = getCooperLevel(test, profile)
  return calculateTotalScore(test, level)
}
