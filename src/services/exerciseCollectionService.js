import { getExerciseType, calculatePoints, calculateTotalScore } from '@/services/exercises.js'
import { toMeters, evaluateCooper } from '@/services/cooper.js'
import { ageAtDate } from '@/stores/useProfileStore.js'

/**
 * Maps test entries to total score values for trend visualization.
 * @param {Array<object>} tests - Array of test entry objects.
 * @param {object} profile - User profile with dob and gender.
 * @returns {Array<{date: string, value: number}>} Mapped score data.
 */
export function filterTestsByTotalScore(tests, profile) {
  if (!tests || !profile) return []
  const genderKey = profile.gender?.toLowerCase() || 'm'
  return tests
    .slice()
    .filter((t) => t.date)
    .map((t) => {
      const age = ageAtDate(profile.dob, t.date)
      const meters = toMeters(t.cooper || 0)
      const level = evaluateCooper(meters, age, genderKey)
      const score = calculateTotalScore(t, level)
      return { date: t.date, value: score }
    })
    .filter((entry) => entry.value > 0)
}

/**
 Filters and maps test entries by the selected exercise.

 @param {Array<object>} tests - Array of test entry objects.
 @param {string} exerciseKey - Key of the exercise to filter by.
 @returns {Array<{date: string, value: number, version: string}>} Filtered and mapped test data.
*/
export function filterTestsByMetric(tests, exerciseKey) {
  const metric = getExerciseType(exerciseKey)
  if (!metric) return []
  return tests
    .slice()
    .filter((t) => t.date && metric.getReps(t) != null)
    .map((t) => {
      const reps = Number(metric.getReps(t))
      const version = metric.getVersion(t)
      const score = calculatePoints(reps, version)
      // Only round score if there's a version (multiplier applied)
      return { date: t.date, value: version ? Math.round(score) : score, reps, version: version?.value }
    })
    .filter((entry) => entry.value > 0) // Only keep entries with positive value
}

export function calculateStats(data) {
  if (!data || data.length === 0) return null
  const values = data.map((d) => d.value).filter((d) => d > 0) // Only positive values
  if (values.length === 0) return null

  const size = values.length
  const min = Math.min(...values)
  const max = Math.max(...values)
  const first = values[0]
  const last = values[values.length - 1]
  const delta = last - first
  const pct = first === 0 ? null : (delta / first) * 100
  return { min, max, first, last, delta, pct, size }
}
