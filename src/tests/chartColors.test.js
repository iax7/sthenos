import { describe, expect, it } from 'vitest'
import { getGradientColors, getColorClass, GRADIENT_COLORS } from '@/services/chartColors.js'

describe('getGradientColors', () => {
  it('returns red for null, negative, or zero pct', () => {
    expect(getGradientColors(null)).toBe(GRADIENT_COLORS.red)
    expect(getGradientColors(-5)).toBe(GRADIENT_COLORS.red)
    expect(getGradientColors(0)).toBe(GRADIENT_COLORS.red)
  })

  it('returns green for strong positive trends (>5%)', () => {
    expect(getGradientColors(5.1)).toBe(GRADIENT_COLORS.green)
    expect(getGradientColors(50)).toBe(GRADIENT_COLORS.green)
  })

  it('returns blue for mild positive trends (0 < pct <= 5)', () => {
    expect(getGradientColors(5)).toBe(GRADIENT_COLORS.blue)
    expect(getGradientColors(0.1)).toBe(GRADIENT_COLORS.blue)
  })
})

describe('getColorClass', () => {
  it('returns empty string when value is not a number', () => {
    expect(getColorClass(10, null)).toBe('')
    expect(getColorClass(10, undefined)).toBe('')
    expect(getColorClass(10, '5')).toBe('')
  })

  it('returns negative for negative values regardless of pct', () => {
    expect(getColorClass(50, -1)).toBe('negative')
  })

  it('returns neutral for a zero value', () => {
    expect(getColorClass(50, 0)).toBe('neutral')
  })

  it('returns green for positive values with a strong pct (>5)', () => {
    expect(getColorClass(6, 10)).toBe('green')
  })

  it('returns positive for positive values without a strong pct', () => {
    expect(getColorClass(5, 10)).toBe('positive')
    expect(getColorClass(null, 10)).toBe('positive')
  })
})
