import { getExerciseType } from '@/services/excercises.js'

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
      const score = version ? reps * version.multiplier : reps
      return { date: t.date, value: reps, version: version?.value, score }
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
