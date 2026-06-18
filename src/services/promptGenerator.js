import { EXERCISES, getReps, getVersion, calculatePoints } from '@/services/exercises.js'
import { toMeters, toKilometers, evaluateCooper, getCooperRanges } from '@/services/cooper.js'
import { filterTestsByMetric, calculateStats } from '@/services/exerciseCollectionService.js'
import { ageAtDate } from '@/stores/useProfileStore.js'

const COOPER_LEVEL_LABELS = {
  1: 'Very Bad',
  2: 'Bad',
  3: 'Normal',
  4: 'Good',
  5: 'Very Good',
}

const VERSION_LABELS = {
  pullup: {
    c: 'Complete',
    n: 'Negative',
    l: 'Bands',
    m: 'Half',
  },
  pushup: {
    c: 'Complete',
    m: 'Half',
    r: 'Reverence',
  },
  squats: {
    c: 'Complete',
  },
  vups: {
    c: 'Complete',
    m: 'Half',
  },
  burpees: {
    c: 'Complete',
    sf: 'No flex',
  },
}

const LOCALE_LANGUAGE_NAMES = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  pt: 'Portuguese',
  de: 'German',
  it: 'Italian',
}

function getLanguageName(locale) {
  const base = (locale || 'en').split('-')[0].toLowerCase()
  return LOCALE_LANGUAGE_NAMES[base] || locale
}

function buildExerciseContext() {
  const lines = []
  const exercisesWithoutCooper = EXERCISES.filter((e) => e.key !== 'cooper')

  for (const ex of exercisesWithoutCooper) {
    const versions = ex.versions
    if (!versions || versions.length === 0) continue
    const versionDescriptions = versions
      .map((v) => {
        const label = VERSION_LABELS[ex.key]?.[v.value] || v.value
        return `${label} (${v.multiplier}x)`
      })
      .join(', ')
    lines.push(`- ${ex.label}: ${versionDescriptions}`)
  }

  return lines.join('\n')
}

function formatTestEntry(test, profile) {
  const age = ageAtDate(profile.dob, test.date)
  const genderKey = profile.gender?.toLowerCase() || 'm'
  const lines = []

  lines.push(`### Test ${test.date} (Age: ${age})`)
  lines.push('| Exercise | Reps | Version | Points |')
  lines.push('|----------|------|---------|--------|')

  let totalPoints = 0

  for (const ex of EXERCISES) {
    if (ex.key === 'cooper') continue

    const reps = getReps(test, ex.key)
    if (reps == null || reps <= 0) continue

    const version = getVersion(test, ex.key)
    const points = calculatePoints(reps, version)
    const roundedPoints = version ? Math.round(points) : points
    totalPoints += roundedPoints

    const versionLabel = version
      ? `${VERSION_LABELS[ex.key]?.[version.value] || version.value} (${version.multiplier}x)`
      : '—'

    lines.push(`| ${ex.label} | ${reps} | ${versionLabel} | ${roundedPoints} |`)
  }

  const cooperLaps = getReps(test, 'cooper')
  if (cooperLaps && cooperLaps > 0) {
    const meters = toMeters(cooperLaps)
    const km = toKilometers(meters)
    const level = evaluateCooper(meters, age, genderKey)
    const levelLabel = level ? `${level} (${COOPER_LEVEL_LABELS[level]})` : 'N/A'
    lines.push(
      `| Cooper | ${cooperLaps} laps (${meters}m / ${km.toFixed(2)}km) | Level: ${levelLabel} | — |`,
    )
  } else {
    lines.push('| Cooper | 0 | — | — |')
  }

  lines.push(`| **Total** | | | **${totalPoints}** |`)

  return lines.join('\n')
}

const RECENT_WINDOW = 3

function recentScores(data) {
  if (data.length < RECENT_WINDOW) return null
  return data.slice(-RECENT_WINDOW).map((d) => d.value)
}

function buildProgressionSummary(tests) {
  const lines = []

  for (const ex of EXERCISES) {
    const data = filterTestsByMetric(tests, ex.key)
    const stats = calculateStats(data)
    if (!stats) continue

    let longTerm
    if (ex.key === 'cooper') {
      const firstMeters = toMeters(stats.first)
      const lastMeters = toMeters(stats.last)
      const deltaMeters = lastMeters - firstMeters
      longTerm = `First ${stats.first} laps (${firstMeters}m) → Last ${stats.last} laps (${lastMeters}m) (Δ${deltaMeters >= 0 ? '+' : ''}${deltaMeters}m)`
    } else {
      const pctStr = stats.pct != null ? `, ${stats.pct >= 0 ? '+' : ''}${stats.pct.toFixed(1)}%` : ''
      longTerm = `First ${stats.first} → Last ${stats.last} (Δ${stats.delta >= 0 ? '+' : ''}${stats.delta}${pctStr})`
    }

    const recent = recentScores(data)
    const unit = ex.key === 'cooper' ? 'laps' : 'pts'
    const recentStr = recent
      ? ` | Last ${RECENT_WINDOW} scores (${unit}): ${recent.join(' → ')}`
      : ''
    lines.push(`- ${ex.label}: ${longTerm}${recentStr}`)
  }

  return lines.length > 0 ? lines.join('\n') : 'No progression data available.'
}

function buildPersonalBests(tests) {
  const lines = []

  for (const ex of EXERCISES) {
    const data = filterTestsByMetric(tests, ex.key)
    if (!data || data.length === 0) continue

    if (ex.key === 'cooper') {
      const maxEntry = data.reduce((best, d) => (d.value > best.value ? d : best), data[0])
      const meters = toMeters(maxEntry.value)
      const dates = data.filter((d) => d.value === maxEntry.value).map((d) => d.date)
      lines.push(`- Cooper: ${maxEntry.value} laps (${meters}m) (${dates.join(', ')})`)
    } else {
      const maxValue = Math.max(...data.map((d) => d.value))
      const dates = data.filter((d) => d.value === maxValue).map((d) => d.date)
      lines.push(`- ${ex.label}: ${maxValue} pts (${dates.join(', ')})`)
    }
  }

  return lines.length > 0 ? lines.join('\n') : 'No personal bests available.'
}

function buildImprovementPotential(lastTest) {
  const lines = []

  for (const ex of EXERCISES) {
    if (ex.key === 'cooper') continue
    const versions = ex.versions
    if (!versions || versions.length === 0) continue

    const maxVersion = versions.find((v) => v.multiplier === 1) || versions[0]
    const version = getVersion(lastTest, ex.key)
    const currentLabel = version
      ? `${VERSION_LABELS[ex.key]?.[version.value] || version.value} (${version.multiplier}x)`
      : '—'
    const maxLabel = `${VERSION_LABELS[ex.key]?.[maxVersion.value] || maxVersion.value} (${maxVersion.multiplier}x)`
    const atMax = version && version.multiplier === maxVersion.multiplier

    lines.push(`- ${ex.label}: Current: ${currentLabel} | Max: ${maxLabel}${atMax ? '' : ' ← room to progress'}`)
  }

  return lines.length > 0 ? lines.join('\n') : 'No data available.'
}

/**
 * Generate a structured prompt for any LLM to provide fitness recommendations.
 * @param {object} profile - User profile { name, gender, dob }
 * @param {Array<object>} tests - Array of test entries sorted by date
 * @param {string} locale - Browser locale (e.g., 'en', 'es')
 * @returns {string} Formatted prompt ready to paste into an LLM
 */
export function generateLLMPrompt(profile, tests, locale) {
  if (!profile) return ''

  const sortedTests = [...(tests || [])].sort((a, b) =>
    String(a.date || '').localeCompare(String(b.date || '')),
  )
  const genderLabel = profile.gender === 'F' ? 'Female' : 'Male'
  const genderKey = profile.gender?.toLowerCase() || 'm'
  const language = getLanguageName(locale)

  const sections = []

  sections.push(`You are a fitness coach analyzing performance test data. Respond in ${language}.`)

  sections.push(`## Exercise System Context
This fitness evaluation uses 5 bodyweight exercises and a Cooper cardio test (12-minute run).
Each exercise may have different execution versions with point multipliers:
${buildExerciseContext()}
- Cooper Test: 12-minute run measured in laps (1 lap = 320m). Fitness levels 1–5 (Very Bad to Very Good) based on age/gender reference tables.

Important: A value of 0 or missing data for any exercise means that exercise was NOT performed on that test date. Do not interpret it as a failed attempt with zero reps — simply omit it from your analysis.`)

  sections.push(`## Test Protocol
- The Cooper test (12-minute run) is performed 1 day before the bodyweight exercises.
- Bodyweight exercises are performed in the following order:
    1. Pull Ups
    2. Push Ups
    3. Squats
    4. V-Ups
    5. Burpees
- Each exercise duration: 1 minute (max reps in that time).
- Rest between exercises: 1 minute.`)

  const currentAge = ageAtDate(profile.dob, new Date().toISOString().slice(0, 10))

  sections.push(`## User Profile
- Name: ${profile.name}
- Gender: ${genderLabel}
- Date of Birth: ${profile.dob}
- Current Age: ${currentAge} years`)

  const ranges = getCooperRanges(currentAge, genderKey)
  if (ranges) {
    const [veryBad, bad, normal, good] = ranges
    sections.push(`## Cooper Scoring Reference (${genderLabel}, age ${currentAge})
- Level 1 (Very Bad): < ${veryBad}m
- Level 2 (Bad): ${veryBad}–${bad - 1}m
- Level 3 (Normal): ${bad}–${normal - 1}m
- Level 4 (Good): ${normal}–${good - 1}m
- Level 5 (Very Good): ≥ ${good}m`)
  }

  if (sortedTests.length > 0) {
    const testEntries = sortedTests.map((test) => formatTestEntry(test, profile)).join('\n\n')
    sections.push(`## Test History (${sortedTests.length} tests, chronological)\n\n${testEntries}`)

    sections.push(`## Progression Summary\n${buildProgressionSummary(sortedTests)}`)

    sections.push(`## Personal Bests\n${buildPersonalBests(sortedTests)}`)

    const lastTest = sortedTests[sortedTests.length - 1]
    sections.push(
      `## Improvement Potential (based on last test: ${lastTest.date})\n${buildImprovementPotential(lastTest)}`,
    )
  } else {
    sections.push(`## Test History\nNo tests recorded yet.`)
  }

  sections.push(`## Goals
- Improve overall test score
- Progress to harder exercise versions over time
- Improve Cooper test fitness level`)

  sections.push(`Based on this data, provide specific and actionable recommendations to improve this person's fitness performance.

First, identify:
- Exercises showing stagnation (plateaus with little or no improvement)
- Exercises showing regression (declining performance)
- Exercises showing accelerated improvement

Then, focus your recommendations on:
1. Weak areas that need the most improvement
2. Exercise version progressions (e.g., when to move from bands to negative pull-ups)
3. Cooper test / cardio improvement strategies
4. Realistic short-term goals based on their progression trend

## Requested Output
For each exercise (including Cooper), provide a summary table with:
- Current level (reps and version)
- Trend (based on recent data)
- Improvement potential (Low / Medium / High)
- Priority (1–10, where 10 is highest priority)
- Recommended next progression step
- 90-day target

Then provide a final recommendation: where should this person invest their next month of training?`)

  return sections.join('\n\n')
}
