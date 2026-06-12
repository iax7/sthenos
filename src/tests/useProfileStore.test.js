import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import {
  createTestMetric,
  useProfileStore,
  ageAtDate,
  migrateProfile,
  normalizeProfile,
} from '@/stores/useProfileStore'

const createBaseProfile = () => ({
  name: 'Taylor',
  gender: 'f',
  dob: '1994-03-15',
})

const testEntry = {
  date: '2025-01-02',
  pullup: { reps: 5, version: 'strict' },
  pushup: { reps: 20, version: 'standard' },
  squats: { reps: 30, version: 'standard' },
  vups: { reps: 12, version: 'standard' },
  burpees: { reps: 15, version: 'standard' },
  cooper: 2100,
}

describe('useProfileStore', () => {
  let store

  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    store = useProfileStore()
    store.clearProfile()
  })

  afterEach(() => {
    store.clearProfile()
  })

  it('returns null when no profile exists', () => {
    expect(store.loadProfile()).toBeNull()
    expect(store.hasProfile).toBe(false)
  })

  it('saves and normalizes profile data', () => {
    const saved = store.saveProfile({ ...createBaseProfile(), gender: 'm', dob: '1996-01-01' })

    expect(saved.gender).toBe('M')
    expect(saved.dob).toBe('1996-01-01')
    expect(store.hasProfile).toBe(true)

    const loaded = store.loadProfile()
    expect(loaded).toMatchObject({ name: 'Taylor', gender: 'M', dob: '1996-01-01' })
  })

  it('saveProfile does not affect tests', () => {
    store.saveProfile(createBaseProfile())
    store.appendTest(testEntry)
    expect(store.tests).toHaveLength(1)

    store.saveProfile({ name: 'Updated', gender: 'M', dob: '1994-03-15' })
    expect(store.tests).toHaveLength(1)
    expect(store.profile.name).toBe('Updated')
  })

  it('appendTest adds and sorts entries by date', () => {
    store.saveProfile(createBaseProfile())

    const later = { ...testEntry, date: '2025-02-01' }
    const earlier = { ...testEntry, date: '2025-01-01', cooper: 1800 }

    store.appendTest(later)
    store.appendTest(earlier)

    expect(store.tests.map((t) => t.date)).toEqual(['2025-01-01', '2025-02-01'])
  })

  it('updateTest returns null for invalid index', () => {
    expect(store.updateTest(1, testEntry)).toBeNull()
  })

  it('updateTest updates entry and keeps sorted order', () => {
    store.saveProfile(createBaseProfile())
    store.appendTest(testEntry)

    const updated = store.updateTest(0, { ...testEntry, date: '2024-12-31', cooper: 1900 })

    expect(updated.cooper).toBe(1900)
    expect(store.tests[0].date).toBe('2024-12-31')
  })

  it('deleteTest returns false for invalid index', () => {
    store.saveProfile(createBaseProfile())
    store.appendTest(testEntry)

    expect(store.deleteTest(2)).toBe(false)
  })

  it('deleteTest removes entry', () => {
    store.saveProfile(createBaseProfile())
    store.appendTest(testEntry)

    expect(store.deleteTest(0)).toBe(true)
    expect(store.tests.length).toBe(0)
  })

  it('importProfile rejects invalid structures', () => {
    const result = store.importProfile({ name: 'Sam', gender: 'X', dob: '1997-05-01' })
    expect(result.ok).toBe(false)
  })

  it('importProfile normalizes cooper and stores profile and tests', () => {
    const result = store.importProfile({
      name: 'Sam',
      gender: 'F',
      dob: '1997-05-01',
      tests: [{ ...testEntry, cooper: '2200' }],
    })

    expect(result.ok).toBe(true)
    expect(store.tests[0].cooper).toBe(2200)
    expect(result.profile.name).toBe('Sam')
  })

  it('importProfileFromUrl handles fetch errors', async () => {
    globalThis.fetch = vi
      .fn()
      .mockResolvedValue({ ok: false, status: 404, statusText: 'Not Found' })

    const result = await store.importProfileFromUrl('https://example.com/profile.json')

    expect(result.ok).toBe(false)
    expect(result.error).toContain('HTTP 404')
  })

  it('importProfileFromUrl stores profile on success', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ ...createBaseProfile(), tests: [testEntry] }),
    })

    const result = await store.importProfileFromUrl('https://example.com/profile.json')

    expect(result.ok).toBe(true)
    expect(store.tests).toHaveLength(1)
  })

  it('createTestMetric normalizes reps and version', () => {
    expect(createTestMetric('12', ' standard ')).toEqual({ reps: 12, version: 'standard' })
    expect(createTestMetric(undefined, '')).toEqual({ reps: 0, version: '' })
  })

  it('ageAtDate computes correct age relative to test date', () => {
    expect(ageAtDate('1990-06-15', '2026-06-15')).toBe(36)
    expect(ageAtDate('1990-06-15', '2026-06-14')).toBe(35)
    expect(ageAtDate('', '2026-01-01')).toBe(0)
    expect(ageAtDate('1990-01-01', '')).toBe(0)
  })

  it('clearProfile removes profile and tests from storage and state', () => {
    store.saveProfile(createBaseProfile())
    store.appendTest(testEntry)
    expect(store.hasProfile).toBe(true)

    store.clearProfile()
    expect(store.profile).toBeNull()
    expect(store.tests).toEqual([])
    expect(store.hasProfile).toBe(false)
    expect(localStorage.getItem('user_profile_v1')).toBeNull()
    expect(localStorage.getItem('user_tests_v1')).toBeNull()
  })

  it('exportProfile returns combined JSON with tests', () => {
    store.saveProfile(createBaseProfile())
    store.appendTest(testEntry)

    const json = store.exportProfile()
    const parsed = JSON.parse(json)
    expect(parsed.name).toBe('Taylor')
    expect(parsed.tests).toHaveLength(1)
    expect(json).toContain('\n')
  })

  it('exportProfile returns default when no profile', () => {
    const json = store.exportProfile()
    const parsed = JSON.parse(json)
    expect(parsed.name).toBe('')
    expect(parsed.tests).toEqual([])
  })

  it('saveLastImportUrl persists and retrieves URL', () => {
    store.saveLastImportUrl('  https://example.com/profile.json  ')
    expect(store.getLastImportUrl()).toBe('https://example.com/profile.json')
  })

  it('saveLastImportUrl ignores empty values', () => {
    store.saveLastImportUrl('')
    expect(store.getLastImportUrl()).toBeNull()

    store.saveLastImportUrl('   ')
    expect(store.getLastImportUrl()).toBeNull()
  })

  it('clearLastImportUrl removes saved URL', () => {
    store.saveLastImportUrl('https://example.com/profile.json')
    store.clearLastImportUrl()
    expect(store.getLastImportUrl()).toBeNull()
  })

  it('saveProfile trims name and email', () => {
    const saved = store.saveProfile({
      ...createBaseProfile(),
      name: '  Taylor  ',
      email: '  taylor@test.com  ',
    })
    expect(saved.name).toBe('Taylor')
    expect(saved.email).toBe('taylor@test.com')
  })

  it('saveProfile sets updatedAt timestamp', () => {
    const before = new Date().toISOString()
    store.saveProfile(createBaseProfile())
    const after = new Date().toISOString()
    expect(store.profile.updatedAt).toBeDefined()
    expect(store.profile.updatedAt >= before).toBe(true)
    expect(store.profile.updatedAt <= after).toBe(true)
  })

  it('appendTest updates updatedAt on profile', () => {
    store.saveProfile(createBaseProfile())
    const savedAt = store.profile.updatedAt
    store.appendTest(testEntry)
    expect(store.profile.updatedAt >= savedAt).toBe(true)
  })

  it('updateTest updates updatedAt on profile', () => {
    store.saveProfile(createBaseProfile())
    store.appendTest(testEntry)
    const before = store.profile.updatedAt
    store.updateTest(0, { ...testEntry, cooper: 2500 })
    expect(store.profile.updatedAt >= before).toBe(true)
  })

  it('deleteTest updates updatedAt on profile', () => {
    store.saveProfile(createBaseProfile())
    store.appendTest(testEntry)
    const before = store.profile.updatedAt
    store.deleteTest(0)
    expect(store.profile.updatedAt >= before).toBe(true)
  })

  it('importProfile returns isOlder when importing older data', () => {
    store.saveProfile(createBaseProfile())
    const oldTimestamp = '2020-01-01T00:00:00.000Z'
    const result = store.importProfile({
      name: 'Old',
      gender: 'M',
      dob: '1990-01-01',
      updatedAt: oldTimestamp,
      tests: [],
    })
    expect(result.ok).toBe(true)
    expect(result.isOlder).toBe(true)
  })

  it('importProfile returns isOlder false when no timestamps', () => {
    const result = store.importProfile({
      name: 'New',
      gender: 'F',
      dob: '1995-01-01',
      tests: [],
    })
    expect(result.ok).toBe(true)
    expect(result.isOlder).toBe(false)
  })

  it('exportProfile includes updatedAt', () => {
    store.saveProfile(createBaseProfile())
    const json = store.exportProfile()
    const parsed = JSON.parse(json)
    expect(parsed.updatedAt).toBeDefined()
  })

  it('migrates legacy combined format on load', () => {
    localStorage.setItem(
      'user_profile_v1',
      JSON.stringify({ name: 'Old', gender: 'M', dob: '1990-01-01', tests: [testEntry] }),
    )
    store.loadProfile()
    expect(store.profile.name).toBe('Old')
    expect(store.tests).toHaveLength(1)
  })

  it('migrates legacy age to dob on load', () => {
    localStorage.setItem(
      'user_profile_v1',
      JSON.stringify({ name: 'Old', gender: 'M', age: 30, tests: [] }),
    )
    const loaded = store.loadProfile()
    expect(loaded.dob).toBe(`${new Date().getFullYear() - 30}-01-01`)
    expect(loaded).not.toHaveProperty('age')
  })

  it('storage persistence works correctly across reload', () => {
    localStorage.clear()
    store.saveProfile(createBaseProfile())
    store.appendTest(testEntry)

    // Simulate reload
    store.loadProfile()
    expect(store.tests).toHaveLength(1)

    store.updateTest(0, { ...testEntry, cooper: 2300 })
    expect(JSON.parse(store.exportProfile()).tests[0].cooper).toBe(2300)

    expect(store.deleteTest(0)).toBe(true)
    expect(store.tests).toHaveLength(0)
  })
})

describe('migrateProfile', () => {
  it('converts legacy age to dob and strips tests', () => {
    const result = migrateProfile({ name: 'Test', gender: 'M', age: 25, tests: [testEntry] })
    expect(result.dob).toBe(`${new Date().getFullYear() - 25}-01-01`)
    expect(result).not.toHaveProperty('age')
    expect(result).not.toHaveProperty('tests')
  })

  it('preserves existing dob and removes age', () => {
    const result = migrateProfile({ name: 'Test', gender: 'M', dob: '1990-05-20', age: 30 })
    expect(result.dob).toBe('1990-05-20')
    expect(result).not.toHaveProperty('age')
  })

  it('handles profile without age or dob', () => {
    const result = migrateProfile({ name: 'Test', gender: 'M' })
    expect(result).not.toHaveProperty('age')
  })
})

describe('normalizeProfile', () => {
  it('trims and uppercases fields', () => {
    const result = normalizeProfile({
      name: '  Ana  ',
      gender: ' f ',
      email: '  ana@test.com  ',
      dob: ' 1990-01-01 ',
    })
    expect(result.name).toBe('Ana')
    expect(result.gender).toBe('F')
    expect(result.email).toBe('ana@test.com')
    expect(result.dob).toBe('1990-01-01')
  })

  it('defaults missing fields to empty strings', () => {
    const result = normalizeProfile({})
    expect(result.name).toBe('')
    expect(result.gender).toBe('')
    expect(result.email).toBe('')
    expect(result.dob).toBe('')
  })

  it('does not include tests in output', () => {
    const result = normalizeProfile({ name: 'Test', tests: [1, 2, 3] })
    expect(result).not.toHaveProperty('tests')
  })

  it('handles non-string types gracefully', () => {
    const result = normalizeProfile({ name: 123, gender: null, email: undefined, dob: false })
    expect(result.name).toBe('')
    expect(result.gender).toBe('')
    expect(result.email).toBe('')
    expect(result.dob).toBe('')
  })
})
