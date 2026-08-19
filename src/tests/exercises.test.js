import { describe, expect, it } from 'vitest'
import {
  getReps,
  getVersion,
  getExerciseType,
  calculatePoints,
  calculateCooperPoints,
  calculateTotalScore,
  getTestScore,
} from '@/services/exercises.js'

describe('getReps', () => {
  it('reads reps from an object entry', () => {
    expect(getReps({ pullup: { reps: 10, version: 'c' } }, 'pullup')).toBe(10)
  })

  it('reads a bare number entry for backward compatibility', () => {
    expect(getReps({ pullup: 8 }, 'pullup')).toBe(8)
  })

  it('returns null when the key is missing', () => {
    expect(getReps({}, 'pullup')).toBeNull()
  })
})

describe('getVersion', () => {
  it('finds the matching version object by value', () => {
    const version = getVersion({ pullup: { reps: 10, version: 'n' } }, 'pullup')
    expect(version).toMatchObject({ value: 'n', multiplier: 0.7 })
  })

  it('returns null for exercises with no versions (cooper)', () => {
    expect(getVersion({ cooper: 7 }, 'cooper')).toBeNull()
  })

  it('returns null when the stored version does not match any known version', () => {
    expect(getVersion({ pullup: { reps: 10, version: 'unknown' } }, 'pullup')).toBeNull()
  })
})

describe('getExerciseType', () => {
  it('returns the exercise definition for a valid key', () => {
    expect(getExerciseType('pullup')).toMatchObject({ key: 'pullup', label: 'Pull Ups' })
  })

  it('returns undefined for an unknown key', () => {
    expect(getExerciseType('unknown')).toBeUndefined()
  })
})

describe('calculatePoints', () => {
  it('returns reps unchanged when there is no version', () => {
    expect(calculatePoints(10, null)).toBe(10)
  })

  it('coerces string reps to a number when a version applies', () => {
    expect(calculatePoints('10', { multiplier: 1 })).toBe(10)
  })

  it('passes reps through as-is (no coercion) when there is no version', () => {
    expect(calculatePoints('10', null)).toBe('10')
  })

  it('falls back to 0 for invalid reps', () => {
    expect(calculatePoints('abc', { multiplier: 1 })).toBe(0)
    expect(calculatePoints(undefined, { multiplier: 1 })).toBe(0)
  })

  it('applies the version multiplier', () => {
    expect(calculatePoints(10, { multiplier: 0.7 })).toBeCloseTo(7)
  })

  it('defaults multiplier to 1 when the version has no numeric multiplier', () => {
    expect(calculatePoints(10, {})).toBe(10)
  })
})

describe('calculateCooperPoints', () => {
  it('returns 0 when no laps were recorded', () => {
    expect(calculateCooperPoints(0, 3)).toBe(0)
    expect(calculateCooperPoints(null, 3)).toBe(0)
    expect(calculateCooperPoints(-1, 3)).toBe(0)
  })

  it('applies the multiplier for a valid level and rounds the result', () => {
    // level 3 => multiplier 0.6, COOPER_MAX_SCORE 50 => 30
    expect(calculateCooperPoints(7, 3)).toBe(30)
    // level 5 => multiplier 1.1, 50 * 1.1 = 55
    expect(calculateCooperPoints(7, 5)).toBe(55)
  })

  it('returns 0 for an invalid or missing level', () => {
    expect(calculateCooperPoints(7, undefined)).toBe(0)
    expect(calculateCooperPoints(7, 99)).toBe(0)
  })
})

describe('calculateTotalScore', () => {
  it('returns 0 when there is no test', () => {
    expect(calculateTotalScore(null, 3)).toBe(0)
  })

  it('sums points across exercises, rounding only when a version applies', () => {
    const test = {
      pullup: { reps: 10, version: 'n' }, // 10 * 0.7 = 7, rounded (has version)
      pushup: 20, // no version -> not rounded, added raw
      squats: { reps: 30, version: 'c' }, // 30 * 1 = 30
      vups: { reps: 15, version: 'c' }, // 15
      burpees: { reps: 10, version: 'sf' }, // 10 * 0.7 = 7
      cooper: 7, // level 3 -> 30
    }
    // 7 + 20 + 30 + 15 + 7 + 30 = 109
    expect(calculateTotalScore(test, 3)).toBe(109)
  })

  it('excludes cooper points when there are no laps', () => {
    const test = { pullup: { reps: 10, version: 'c' }, cooper: 0 }
    expect(calculateTotalScore(test, 5)).toBe(10)
  })
})

describe('getTestScore', () => {
  const profile = { gender: 'M', dob: '1994-06-15' }

  it('returns 0 when test or profile is missing', () => {
    expect(getTestScore(null, profile)).toBe(0)
    expect(getTestScore({ date: '2025-01-15' }, null)).toBe(0)
  })

  it('computes the cooper level from age/gender and scores the full test', () => {
    const test = {
      date: '2025-01-15', // age 30 at test date -> male 30-39 bracket [1500, 1900, 2300, 2700]
      pullup: { reps: 10, version: 'c' },
      cooper: 7, // 2240m -> level 3 (normal) -> 30 points
    }
    // 10 (pullup) + 30 (cooper) = 40
    expect(getTestScore(test, profile)).toBe(40)
  })

  it('defaults to gender "m" when the profile has no gender', () => {
    const test = { date: '2025-01-15', cooper: 7 }
    const noGenderProfile = { dob: '1994-06-15' }
    expect(getTestScore(test, noGenderProfile)).toBe(getTestScore(test, profile))
  })
})
