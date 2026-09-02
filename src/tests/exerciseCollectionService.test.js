import { describe, expect, it } from 'vitest'
import {
  filterTestsByTotalScore,
  filterTestsByMetric,
  calculateStats,
  calculateDashboardSummary,
} from '@/services/exerciseCollectionService.js'

const profile = { gender: 'M', dob: '1994-06-15' }

describe('filterTestsByTotalScore', () => {
  it('returns [] when tests or profile are missing', () => {
    expect(filterTestsByTotalScore(null, profile)).toEqual([])
    expect(filterTestsByTotalScore([{ date: '2025-01-15' }], null)).toEqual([])
  })

  it('drops entries without a date', () => {
    const tests = [{ pullup: { reps: 10, version: 'c' }, cooper: 0 }]
    expect(filterTestsByTotalScore(tests, profile)).toEqual([])
  })

  it('drops entries whose total score is not positive', () => {
    const tests = [{ date: '2025-01-15', cooper: 0 }]
    expect(filterTestsByTotalScore(tests, profile)).toEqual([])
  })

  it('maps valid entries to {date, value}', () => {
    const tests = [{ date: '2025-01-15', pullup: { reps: 10, version: 'c' }, cooper: 0 }]
    expect(filterTestsByTotalScore(tests, profile)).toEqual([{ date: '2025-01-15', value: 10 }])
  })
})

describe('filterTestsByMetric', () => {
  it('returns [] for an unknown exercise key', () => {
    expect(filterTestsByMetric([{ date: '2025-01-15' }], 'unknown')).toEqual([])
  })

  it('drops entries without a date or without reps for the metric', () => {
    const tests = [
      { pullup: { reps: 10, version: 'c' } }, // no date
      { date: '2025-01-15' }, // no pullup reps
    ]
    expect(filterTestsByMetric(tests, 'pullup')).toEqual([])
  })

  it('rounds only when a version multiplier applies', () => {
    const tests = [
      { date: '2025-01-15', pullup: { reps: 10, version: 'n' } }, // 10 * 0.7 = 7, versioned
      { date: '2025-01-16', pushup: 20 }, // bare number, no version
    ]
    expect(filterTestsByMetric(tests, 'pullup')).toEqual([
      { date: '2025-01-15', value: 7, reps: 10, version: 'n' },
    ])
    expect(filterTestsByMetric(tests, 'pushup')).toEqual([
      { date: '2025-01-16', value: 20, reps: 20, version: undefined },
    ])
  })

  it('drops entries with a non-positive value', () => {
    const tests = [{ date: '2025-01-15', pullup: { reps: 0, version: 'c' } }]
    expect(filterTestsByMetric(tests, 'pullup')).toEqual([])
  })
})

describe('calculateStats', () => {
  it('returns null for empty or missing data', () => {
    expect(calculateStats(null)).toBeNull()
    expect(calculateStats([])).toBeNull()
  })

  it('returns null when no values are positive', () => {
    expect(calculateStats([{ date: '2025-01-15', value: 0 }])).toBeNull()
  })

  it('computes min/max/first/last/delta over positive values, in order', () => {
    const data = [
      { date: '2025-01-15', value: 5 },
      { date: '2025-02-15', value: 12 },
      { date: '2025-03-15', value: 8 },
    ]
    expect(calculateStats(data)).toEqual({
      min: 5,
      max: 12,
      first: 5,
      last: 8,
      delta: 3,
      pct: 60,
      size: 3,
    })
  })

  it('computes a negative pct when the trend regresses', () => {
    const data = [
      { date: '2025-01-15', value: 20 },
      { date: '2025-02-15', value: 10 },
    ]
    const stats = calculateStats(data)
    expect(stats.delta).toBe(-10)
    expect(stats.pct).toBe(-50)
  })

  it('ignores non-positive values when picking the first value used for pct', () => {
    // Zero/negative entries are filtered out before first/last are derived,
    // so `first` can never be 0 here -- the `first === 0` null-guard in
    // calculateStats is effectively unreachable through this entry point.
    const data = [
      { date: '2025-01-15', value: 0 },
      { date: '2025-02-15', value: 10 },
    ]
    const stats = calculateStats(data)
    expect(stats.first).toBe(10)
    expect(stats.pct).toBe(0)
  })
})

describe('calculateDashboardSummary', () => {
  const blank = {
    testCount: 0,
    firstYear: null,
    best: null,
    bestDate: null,
    improvement: null,
    cooperLevel: null,
  }

  it('returns a blank summary when tests or profile are missing', () => {
    expect(calculateDashboardSummary(null, profile)).toEqual(blank)
    expect(calculateDashboardSummary([], profile)).toEqual(blank)
    expect(calculateDashboardSummary([{ date: '2025-01-15' }], null)).toEqual(blank)
  })

  it('counts tests and reports the first year', () => {
    const tests = [
      { date: '2025-01-15', pullup: { reps: 10, version: 'c' }, cooper: 0 },
      { date: '2026-01-15', pullup: { reps: 20, version: 'c' }, cooper: 0 },
    ]
    const s = calculateDashboardSummary(tests, profile)
    expect(s.testCount).toBe(2)
    expect(s.firstYear).toBe(2025)
  })

  it('omits improvement for a single test but reports best', () => {
    const s = calculateDashboardSummary(
      [{ date: '2025-01-15', pullup: { reps: 10, version: 'c' }, cooper: 0 }],
      profile,
    )
    expect(s.testCount).toBe(1)
    expect(s.best).toBe(10)
    expect(s.bestDate).toBe('2025-01-15')
    expect(s.improvement).toBeNull()
  })

  it('computes improvement as latest minus earliest valid score', () => {
    const tests = [
      { date: '2025-01-15', pullup: { reps: 10, version: 'c' }, cooper: 0 },
      { date: '2025-02-15', pullup: { reps: 20, version: 'c' }, cooper: 0 },
    ]
    expect(calculateDashboardSummary(tests, profile).improvement).toBe(10)
  })

  it('reports a negative improvement on regression', () => {
    const tests = [
      { date: '2025-01-15', pullup: { reps: 20, version: 'c' }, cooper: 0 },
      { date: '2025-02-15', pullup: { reps: 10, version: 'c' }, cooper: 0 },
    ]
    expect(calculateDashboardSummary(tests, profile).improvement).toBe(-10)
  })

  it('ignores zero-score tests when deriving improvement and best', () => {
    const tests = [
      { date: '2025-01-01', cooper: 0 }, // no exercises, no cooper -> score 0
      { date: '2025-02-01', pullup: { reps: 10, version: 'c' }, cooper: 0 },
      { date: '2025-03-01', pullup: { reps: 20, version: 'c' }, cooper: 0 },
    ]
    const s = calculateDashboardSummary(tests, profile)
    expect(s.testCount).toBe(3)
    expect(s.firstYear).toBe(2025)
    expect(s.best).toBe(20)
    expect(s.bestDate).toBe('2025-03-01')
    expect(s.improvement).toBe(10)
  })

  it('derives the Cooper fitness level from the latest test with laps', () => {
    const tests = [
      { date: '2025-01-15', pullup: { reps: 10, version: 'c' }, cooper: 1 },
      { date: '2025-02-15', pullup: { reps: 20, version: 'c' }, cooper: 1 },
    ]
    // dob 1994-06-15, test 2025-02-15 -> age 30 -> male index 5.
    // 1 lap = 320m < 1500 (very bad) -> level 1.
    expect(calculateDashboardSummary(tests, profile).cooperLevel).toBe(1)
  })

  it('returns a null Cooper level when no test has laps', () => {
    const s = calculateDashboardSummary(
      [{ date: '2025-01-15', pullup: { reps: 10, version: 'c' }, cooper: 0 }],
      profile,
    )
    expect(s.cooperLevel).toBeNull()
  })
})
