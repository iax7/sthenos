import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createTestMetric,
  useProfileStore,
  ageAtDate,
} from '@/stores/useProfileStore'

const createBaseProfile = () => ({
  name: 'Taylor',
  gender: 'f',
  dob: '1994-03-15',
  tests: [],
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
    localStorage.clear()
    store = useProfileStore()
    store.clearProfile()
  })

  afterEach(() => {
    store.clearProfile()
  })

  it('returns null when no profile exists', () => {
    expect(store.loadProfile()).toBeNull()
    expect(store.hasProfile.value).toBe(false)
  })

  it('saves and normalizes profile data', () => {
    const saved = store.saveProfile({ ...createBaseProfile(), gender: 'm', dob: '1996-01-01' })

    expect(saved.gender).toBe('M')
    expect(saved.dob).toBe('1996-01-01')
    expect(store.hasProfile.value).toBe(true)

    const loaded = store.loadProfile()
    expect(loaded).toMatchObject({ name: 'Taylor', gender: 'M', dob: '1996-01-01' })
  })

  it('appendTest adds and sorts entries by date', () => {
    store.saveProfile(createBaseProfile())

    const later = { ...testEntry, date: '2025-02-01' }
    const earlier = { ...testEntry, date: '2025-01-01', cooper: 1800 }

    store.appendTest(later)
    store.appendTest(earlier)

    expect(store.tests.value.map((t) => t.date)).toEqual(['2025-01-01', '2025-02-01'])
  })

  it('updateTest returns null for invalid index', () => {
    expect(store.updateTest(1, testEntry)).toBeNull()
  })

  it('updateTest updates entry and keeps sorted order', () => {
    store.saveProfile({ ...createBaseProfile(), tests: [testEntry] })

    const updated = store.updateTest(0, { ...testEntry, date: '2024-12-31', cooper: 1900 })

    expect(updated.cooper).toBe(1900)
    expect(store.tests.value[0].date).toBe('2024-12-31')
  })

  it('deleteTest returns false for invalid index', () => {
    store.saveProfile({ ...createBaseProfile(), tests: [testEntry] })

    expect(store.deleteTest(2)).toBe(false)
  })

  it('deleteTest removes entry', () => {
    store.saveProfile({ ...createBaseProfile(), tests: [testEntry] })

    expect(store.deleteTest(0)).toBe(true)
    expect(store.tests.value.length).toBe(0)
  })

  it('importProfile rejects invalid structures', () => {
    const result = store.importProfile({ name: 'Sam', gender: 'X', dob: '1997-05-01' })
    expect(result.ok).toBe(false)
  })

  it('importProfile normalizes cooper and stores profile', () => {
    const result = store.importProfile({
      name: 'Sam',
      gender: 'F',
      dob: '1997-05-01',
      tests: [{ ...testEntry, cooper: '2200' }],
    })

    expect(result.ok).toBe(true)
    expect(result.profile.tests[0].cooper).toBe(2200)
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
    expect(result.profile.tests.length).toBe(1)
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

  it('migrates legacy age to dob on load', () => {
    localStorage.setItem(
      'user_profile_v1',
      JSON.stringify({ name: 'Old', gender: 'M', age: 30, tests: [] }),
    )
    const loaded = store.loadProfile()
    expect(loaded.dob).toBe(`${new Date().getFullYear() - 30}-01-01`)
    expect(loaded).not.toHaveProperty('age')
  })

  it('storage persistence works correctly', () => {
    localStorage.clear()
    store.saveProfile(createBaseProfile())
    store.appendTest(testEntry)

    const loaded = store.loadProfile()
    expect(loaded.tests.length).toBe(1)

    store.updateTest(0, { ...testEntry, cooper: 2300 })
    expect(JSON.parse(store.getProfileData()).tests[0].cooper).toBe(2300)

    expect(store.deleteTest(0)).toBe(true)
  })
})
