import {
  getExerciseType,
  calculatePoints,
  getTestScore,
  getCooperLevel,
} from '@/services/exercises.js'

/**
 * Maps test entries to total score values for trend visualization.
 * @param {Array<object>} tests - Array of test entry objects.
 * @param {object} profile - User profile with dob and gender.
 * @returns {Array<{date: string, value: number}>} Mapped score data.
 */
export function filterTestsByTotalScore(tests, profile) {
  if (!tests || !profile) return []
  return tests
    .slice()
    .filter((t) => t.date)
    .map((t) => ({ date: t.date, value: getTestScore(t, profile) }))
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
      return {
        date: t.date,
        value: version ? Math.round(score) : score,
        reps,
        version: version?.value,
      }
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

/**
 * Computes a plain-language summary of a user's test history for the dashboard.
 * Answers the questions a regular person cares about: how many tests they have,
 * when they started, their personal best, whether they are improving, and their
 * latest Cooper fitness level. Pure and directly testable; components only render it.
 *
 * The improvement and best figures use the same positive-score series as the
 * chart, ordered chronologically. Zero-score tests (e.g. non-participation) still
 * count toward the total and the first year, but are ignored for best/improvement.
 *
 * @param {Array<object>} tests - Array of test entry objects.
 * @param {object} profile - User profile with dob and gender.
 * @returns {{testCount:number, firstYear:(number|null), best:(number|null), bestDate:(string|null), improvement:(number|null), cooperLevel:(number|null)}}
 */
export function calculateDashboardSummary(tests, profile) {
  const blank = {
    testCount: 0,
    firstYear: null,
    best: null,
    bestDate: null,
    improvement: null,
    cooperLevel: null,
  }
  if (!tests || !profile) return blank

  const testCount = tests.length
  const dated = tests.filter((t) => t && t.date)
  if (dated.length === 0) return { ...blank, testCount }

  const years = dated
    .map((t) => Number.parseInt(t.date.split('-')[0], 10))
    .filter((y) => Number.isFinite(y))
  const firstYear = years.length ? Math.min(...years) : null

  const series = filterTestsByTotalScore(tests, profile)
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))

  const stats = series.length ? calculateStats(series) : null
  const bestEntry = stats ? series.find((e) => e.value === stats.max) : null

  return {
    testCount,
    firstYear,
    best: stats ? stats.max : null,
    bestDate: bestEntry ? bestEntry.date : null,
    improvement: stats && stats.size >= 2 ? stats.delta : null,
    cooperLevel: latestCooperLevel(dated, profile),
  }
}

/**
 * Returns the Cooper fitness level (1-5) of the most recent test that recorded
 * laps, or null when no test has a positive lap count. Reuses getCooperLevel so
 * the derivation stays identical to the one behind the total score.
 *
 * @param {Array<object>} tests - Test entries that have a date.
 * @param {object} profile - User profile with dob and gender.
 * @returns {number|null} Cooper fitness level 1-5, or null.
 */
function latestCooperLevel(tests, profile) {
  const ordered = tests.slice().sort((a, b) => (a.date || '').localeCompare(b.date || ''))
  for (let i = ordered.length - 1; i >= 0; i--) {
    if (!ordered[i].cooper || ordered[i].cooper <= 0) continue
    const level = getCooperLevel(ordered[i], profile)
    if (level != null) return level
  }
  return null
}
