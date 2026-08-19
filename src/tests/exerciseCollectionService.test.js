import { describe, expect, it } from 'vitest'
import {
  filterTestsByTotalScore,
  filterTestsByMetric,
  calculateStats,
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
