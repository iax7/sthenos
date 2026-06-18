import { describe, expect, it } from 'vitest'
import { generateLLMPrompt } from '@/services/promptGenerator.js'

const profile = {
  name: 'Carlos',
  gender: 'M',
  dob: '1994-06-15',
}

const makeTest = (date, overrides = {}) => ({
  date,
  pullup: { reps: 10, version: 'c' },
  pushup: { reps: 25, version: 'c' },
  squats: { reps: 30, version: 'c' },
  vups: { reps: 15, version: 'c' },
  burpees: { reps: 12, version: 'c' },
  cooper: 7,
  ...overrides,
})

describe('generateLLMPrompt', () => {
  it('returns empty string when no profile', () => {
    expect(generateLLMPrompt(null, [], 'en')).toBe('')
  })

  it('includes profile info', () => {
    const prompt = generateLLMPrompt(profile, [], 'en')
    expect(prompt).toContain('Carlos')
    expect(prompt).toContain('Male')
    expect(prompt).toContain('1994-06-15')
    expect(prompt).toContain('Current Age:')
    expect(prompt).toContain('years')
  })

  it('includes Cooper scoring reference ranges for current age and gender', () => {
    // Male, DOB 1994-06-15, current age 32 → age bracket 30-39
    // Male 30-39 ranges: [1500, 1900, 2300, 2700]
    const prompt = generateLLMPrompt(profile, [], 'en')
    expect(prompt).toContain('Cooper Scoring Reference (Male')
    expect(prompt).toContain('Level 1 (Very Bad): < 1500m')
    expect(prompt).toContain('Level 2 (Bad): 1500–1899m')
    expect(prompt).toContain('Level 3 (Normal): 1900–2299m')
    expect(prompt).toContain('Level 4 (Good): 2300–2700m')
    expect(prompt).toContain('Level 5 (Very Good): ≥ 2701m')
  })

  it('includes exercise system context with version multipliers', () => {
    const prompt = generateLLMPrompt(profile, [], 'en')
    expect(prompt).toContain('Pull Ups')
    expect(prompt).toContain('Complete (1x)')
    expect(prompt).toContain('Negative (0.7x)')
    expect(prompt).toContain('Bands (0.6x)')
    expect(prompt).toContain('Half (0.5x)')
    expect(prompt).toContain('Push Ups')
    expect(prompt).toContain('Reverence (0.3x)')
    expect(prompt).toContain('No flex (0.7x)')
    expect(prompt).toContain('1 lap = 320m')
  })

  it('clarifies that zero or missing values mean exercise was not performed', () => {
    const prompt = generateLLMPrompt(profile, [], 'en')
    expect(prompt).toContain('NOT performed')
    expect(prompt).toContain('Do not interpret it as a failed attempt')
  })

  it('shows no tests message when tests array is empty', () => {
    const prompt = generateLLMPrompt(profile, [], 'en')
    expect(prompt).toContain('No tests recorded yet')
  })

  it('formats test entries with age at test date', () => {
    const tests = [makeTest('2025-01-15')]
    const prompt = generateLLMPrompt(profile, tests, 'en')
    // Age at 2025-01-15 for DOB 1994-06-15 = 30 (birthday not yet passed)
    expect(prompt).toContain('Age: 30')
    expect(prompt).toContain('2025-01-15')
  })

  it('calculates different ages for tests spanning a birthday', () => {
    const tests = [makeTest('2025-01-15'), makeTest('2025-07-15')]
    const prompt = generateLLMPrompt(profile, tests, 'en')
    // Before birthday (June 15): age 30
    expect(prompt).toContain('Age: 30')
    // After birthday (June 15): age 31
    expect(prompt).toContain('Age: 31')
  })

  it('includes Cooper data with meters and kilometers', () => {
    const tests = [makeTest('2025-01-15', { cooper: 7 })]
    const prompt = generateLLMPrompt(profile, tests, 'en')
    // 7 laps * 320 = 2240m = 2.24km
    expect(prompt).toContain('7 laps')
    expect(prompt).toContain('2240m')
    expect(prompt).toContain('2.24km')
  })

  it('includes Cooper fitness level based on age at test date', () => {
    const tests = [makeTest('2025-01-15', { cooper: 7 })]
    const prompt = generateLLMPrompt(profile, tests, 'en')
    // 2240m, male, age 30 → level 3 (Normal) based on 30-39 bracket [1500, 1900, 2300, 2700]
    expect(prompt).toContain('Level: 3 (Normal)')
  })

  it('includes version labels in test rows', () => {
    const tests = [makeTest('2025-01-15', { pullup: { reps: 8, version: 'n' } })]
    const prompt = generateLLMPrompt(profile, tests, 'en')
    expect(prompt).toContain('Negative (0.7x)')
  })

  it('includes progression summary with deltas', () => {
    const tests = [
      makeTest('2025-01-15', { pullup: { reps: 5, version: 'c' } }),
      makeTest('2025-03-15', { pullup: { reps: 10, version: 'c' } }),
    ]
    const prompt = generateLLMPrompt(profile, tests, 'en')
    expect(prompt).toContain('Progression Summary')
    expect(prompt).toContain('Pull Ups')
    expect(prompt).toContain('First 5')
    expect(prompt).toContain('Last 10')
  })

  it('shows last 3 raw scores for recent trend', () => {
    const tests = [
      makeTest('2025-01-15', { pullup: { reps: 16, version: 'c' } }),
      makeTest('2025-02-15', { pullup: { reps: 13, version: 'c' } }),
      makeTest('2025-03-15', { pullup: { reps: 14, version: 'c' } }),
    ]
    const prompt = generateLLMPrompt(profile, tests, 'en')
    expect(prompt).toContain('Last 3 scores (pts): 16 → 13 → 14')
  })

  it('omits last 3 scores when fewer than 3 tests', () => {
    const tests = [
      makeTest('2025-01-15', { pullup: { reps: 5, version: 'c' } }),
      makeTest('2025-03-15', { pullup: { reps: 10, version: 'c' } }),
    ]
    const prompt = generateLLMPrompt(profile, tests, 'en')
    expect(prompt).not.toContain('Last 3 scores')
  })

  it('includes personal bests with dates', () => {
    const tests = [
      makeTest('2025-01-15', { pullup: { reps: 5, version: 'c' } }),
      makeTest('2025-02-15', { pullup: { reps: 12, version: 'c' } }),
      makeTest('2025-03-15', { pullup: { reps: 8, version: 'c' } }),
    ]
    const prompt = generateLLMPrompt(profile, tests, 'en')
    expect(prompt).toContain('Personal Bests')
    expect(prompt).toContain('Pull Ups: 12 pts (2025-02-15)')
  })

  it('lists multiple dates for tied personal bests', () => {
    const tests = [
      makeTest('2025-01-15', { pullup: { reps: 10, version: 'c' } }),
      makeTest('2025-02-15', { pullup: { reps: 8, version: 'c' } }),
      makeTest('2025-03-15', { pullup: { reps: 10, version: 'c' } }),
    ]
    const prompt = generateLLMPrompt(profile, tests, 'en')
    expect(prompt).toContain('Pull Ups: 10 pts (2025-01-15, 2025-03-15)')
  })

  it('shows Cooper personal best in laps and meters', () => {
    const tests = [
      makeTest('2025-01-15', { cooper: 6 }),
      makeTest('2025-02-15', { cooper: 8 }),
      makeTest('2025-03-15', { cooper: 7 }),
    ]
    const prompt = generateLLMPrompt(profile, tests, 'en')
    expect(prompt).toContain('Cooper: 8 laps (2560m)')
  })

  it('sorts tests chronologically', () => {
    const tests = [makeTest('2025-06-01'), makeTest('2025-01-01')]
    const prompt = generateLLMPrompt(profile, tests, 'en')
    const idx1 = prompt.indexOf('2025-01-01')
    const idx2 = prompt.indexOf('2025-06-01')
    expect(idx1).toBeLessThan(idx2)
  })

  it('includes language instruction for English locale', () => {
    const prompt = generateLLMPrompt(profile, [], 'en')
    expect(prompt).toContain('Respond in English')
  })

  it('includes language instruction for Spanish locale', () => {
    const prompt = generateLLMPrompt(profile, [], 'es')
    expect(prompt).toContain('Respond in Spanish')
  })

  it('handles locale T with region code', () => {
    const prompt = generateLLMPrompt(profile, [], 'es-MX')
    expect(prompt).toContain('Respond in Spanish')
  })

  it('includes recommendation focus areas', () => {
    const prompt = generateLLMPrompt(profile, [makeTest('2025-01-15')], 'en')
    expect(prompt).toContain('Weak areas')
    expect(prompt).toContain('Exercise version progressions')
    expect(prompt).toContain('Cooper test')
    expect(prompt).toContain('short-term goals')
  })

  it('asks LLM to detect stagnation, regression, and acceleration', () => {
    const prompt = generateLLMPrompt(profile, [makeTest('2025-01-15')], 'en')
    expect(prompt).toContain('stagnation')
    expect(prompt).toContain('regression')
    expect(prompt).toContain('accelerated improvement')
  })

  it('includes test protocol details', () => {
    const prompt = generateLLMPrompt(profile, [], 'en')
    expect(prompt).toContain('Test Protocol')
    expect(prompt).toContain('1 day before')
    expect(prompt).toContain('1. Pull Ups')
    expect(prompt).toContain('1 minute')
    expect(prompt).toContain('1 minute')
  })

  it('includes requested output format with priority and 90-day target', () => {
    const prompt = generateLLMPrompt(profile, [makeTest('2025-01-15')], 'en')
    expect(prompt).toContain('Requested Output')
    expect(prompt).toContain('Priority (1–10')
    expect(prompt).toContain('90-day target')
    expect(prompt).toContain('next month of training')
  })

  it('handles female profile', () => {
    const femaleProfile = { ...profile, gender: 'F' }
    const prompt = generateLLMPrompt(femaleProfile, [], 'en')
    expect(prompt).toContain('Female')
  })

  it('shows test count in history heading', () => {
    const tests = [makeTest('2025-01-15'), makeTest('2025-02-15'), makeTest('2025-03-15')]
    const prompt = generateLLMPrompt(profile, tests, 'en')
    expect(prompt).toContain('3 tests')
  })

  it('includes standard goals section', () => {
    const prompt = generateLLMPrompt(profile, [makeTest('2025-01-15')], 'en')
    expect(prompt).toContain('## Goals')
    expect(prompt).toContain('Improve overall test score')
    expect(prompt).toContain('harder exercise versions')
    expect(prompt).toContain('Cooper test fitness level')
  })

  it('shows improvement potential with room to progress for non-complete versions', () => {
    const tests = [
      makeTest('2025-01-15', {
        pullup: { reps: 8, version: 'n' },
        burpees: { reps: 10, version: 'sf' },
      }),
    ]
    const prompt = generateLLMPrompt(profile, tests, 'en')
    expect(prompt).toContain('Improvement Potential')
    expect(prompt).toContain('Pull Ups: Current: Negative (0.7x) | Max: Complete (1x) ← room to progress')
    expect(prompt).toContain('Burpees: Current: No flex (0.7x) | Max: Complete (1x) ← room to progress')
  })

  it('shows no room to progress when already at max version', () => {
    const tests = [makeTest('2025-01-15', { pushup: { reps: 20, version: 'c' } })]
    const prompt = generateLLMPrompt(profile, tests, 'en')
    expect(prompt).toContain('Push Ups: Current: Complete (1x) | Max: Complete (1x)')
    expect(prompt).not.toContain('Push Ups: Current: Complete (1x) | Max: Complete (1x) ←')
  })

  it('uses last test date in improvement potential heading', () => {
    const tests = [makeTest('2025-01-15'), makeTest('2025-06-15')]
    const prompt = generateLLMPrompt(profile, tests, 'en')
    expect(prompt).toContain('based on last test: 2025-06-15')
  })
})
