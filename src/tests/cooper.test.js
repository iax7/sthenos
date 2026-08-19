import { describe, expect, it } from 'vitest'
import { evaluateCooper, toMeters, toKilometers, getCooperRanges } from '@/services/cooper.js'

describe('getCooperRanges (age bracket boundaries)', () => {
  it('returns null below the minimum supported age', () => {
    expect(getCooperRanges(10, 'm')).toBeNull()
  })

  it.each([
    [11, [1950, 2050, 2250, 2601]],
    [12, [1950, 2050, 2250, 2601]],
    [13, [2100, 2200, 2400, 2701]],
    [14, [2100, 2200, 2400, 2701]],
    [15, [2200, 2300, 2500, 2801]],
    [16, [2200, 2300, 2500, 2801]],
    [17, [2300, 2500, 2700, 3001]],
    [19, [2300, 2500, 2700, 3001]],
    [20, [1600, 2200, 2400, 2801]],
    [29, [1600, 2200, 2400, 2801]],
    [30, [1500, 1900, 2300, 2701]],
    [39, [1500, 1900, 2300, 2701]],
    [40, [1400, 1700, 2100, 2501]],
    [49, [1400, 1700, 2100, 2501]],
    [50, [1300, 1600, 2000, 2401]],
    [65, [1300, 1600, 2000, 2401]],
  ])('age %i (male) maps to bracket %j', (age, ranges) => {
    expect(getCooperRanges(age, 'm')).toEqual(ranges)
  })

  it('returns null for an unknown gender key', () => {
    expect(getCooperRanges(25, 'x')).toBeNull()
  })
})

describe('evaluateCooper', () => {
  // Male 20-29 bracket: [veryBad 1600, bad 2200, normal 2400, good 2801]
  it.each([
    [1599, 1],
    [1600, 2],
    [2199, 2],
    [2200, 3],
    [2399, 3],
    [2400, 4],
    [2800, 4],
    [2801, 5],
  ])('male, age 25, %i meters -> level %i', (meters, level) => {
    expect(evaluateCooper(meters, 25, 'm')).toBe(level)
  })

  // Female 30-39 bracket: [veryBad 1400, bad 1700, normal 2000, good 2501]
  it.each([
    [1399, 1],
    [1400, 2],
    [1699, 2],
    [1700, 3],
    [1999, 3],
    [2000, 4],
    [2500, 4],
    [2501, 5],
  ])('female, age 35, %i meters -> level %i', (meters, level) => {
    expect(evaluateCooper(meters, 35, 'f')).toBe(level)
  })

  it('returns null when age is out of supported range', () => {
    expect(evaluateCooper(2000, 10, 'm')).toBeNull()
  })

  it('throws for an unknown gender key', () => {
    expect(() => evaluateCooper(2000, 25, 'x')).toThrow()
  })
})

describe('toMeters / toKilometers', () => {
  it('converts laps to meters (320m per lap)', () => {
    expect(toMeters(7)).toBe(2240)
    expect(toMeters(0)).toBe(0)
  })

  it('converts meters to kilometers', () => {
    expect(toKilometers(2240)).toBeCloseTo(2.24)
  })
})
