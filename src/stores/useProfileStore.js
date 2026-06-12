// Pinia store for reactive profile management with localStorage persistence.
// Profile and tests are stored independently to prepare for future Supabase migration.

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

/**
 * @typedef {Object} UserProfile
 * @property {string} name
 * @property {string} gender - 'M' or 'F'
 * @property {string} dob - ISO date string (YYYY-MM-DD)
 * @property {string} [email]
 */
/**
 * @typedef {Object} TestEntry
 * @property {string} date - ISO date string (YYYY-MM-DD)
 * @property {TestMetric} pullup
 * @property {TestMetric} pushup
 * @property {TestMetric} squats
 * @property {TestMetric} vups
 * @property {TestMetric} burpees
 * @property {number} cooper - Distance or value for cooper test
 */
/**
 * @typedef {Object} TestMetric
 * @property {number} reps
 * @property {string} version
 */

const PROFILE_STORAGE_KEY = 'user_profile_v1'
const TESTS_STORAGE_KEY = 'user_tests_v1'
const URL_STORAGE_KEY = 'profile_import_url'
const VALID_GENDERS = ['M', 'F']

/**
 * Create a test metric object.
 * @param {number} reps
 * @param {string} version
 * @returns {{reps: number, version: string}}
 * @example
 * createTestMetric(10, 'standard') // { reps: 10, version: 'standard' }
 */
export function createTestMetric(reps, version) {
  const repetitions = Number(reps) || 0
  const ver = (version || '').trim()
  return { reps: repetitions, version: ver }
}

// --- Storage helpers (read/write only, no logic) ---

function readJSON(key) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw)
  } catch (e) {
    console.warn(`[useProfileStore] Failed to read ${key}:`, e)
    return null
  }
}

function writeJSON(key, data) {
  localStorage.setItem(key, JSON.stringify(data))
}

// --- Pure transformation functions ---

/**
 * Apply data migrations to a raw profile object.
 * Converts legacy fields to the current schema.
 * @param {Object} data - raw parsed profile
 * @returns {Object} migrated profile (without tests)
 */
export function migrateProfile(data) {
  const migrated = { ...data }
  if ((!migrated.dob || typeof migrated.dob !== 'string') && migrated.age) {
    const rawAge = Number(migrated.age)
    if (!isNaN(rawAge) && rawAge > 0) {
      migrated.dob = `${new Date().getFullYear() - rawAge}-01-01`
    }
  }
  delete migrated.age
  delete migrated.tests
  return migrated
}

/**
 * Normalize and sanitize profile data to ensure consistent types and formatting.
 * @param {Object} data
 * @returns {UserProfile}
 */
export function normalizeProfile(data) {
  return {
    name: (typeof data.name === 'string' ? data.name : '').trim(),
    gender: (typeof data.gender === 'string' ? data.gender : '').toUpperCase().trim(),
    email: (typeof data.email === 'string' ? data.email : '').trim(),
    dob: (typeof data.dob === 'string' ? data.dob : '').trim(),
    updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : null,
  }
}

// --- Loading with migration ---

function loadProfileFromStorage() {
  // Try new separate key first
  const profileData = readJSON(PROFILE_STORAGE_KEY)
  if (profileData && !profileData.tests) {
    // Already migrated to separate keys
    return normalizeProfile(migrateProfile(profileData))
  }
  if (profileData && Array.isArray(profileData.tests)) {
    // Legacy format: tests embedded in profile — migrate
    return normalizeProfile(migrateProfile(profileData))
  }
  if (profileData) {
    return normalizeProfile(migrateProfile(profileData))
  }
  return null
}

function loadTestsFromStorage() {
  // Try new separate key first
  const testsData = readJSON(TESTS_STORAGE_KEY)
  if (Array.isArray(testsData)) return testsData

  // Fallback: extract from legacy combined format
  const legacy = readJSON(PROFILE_STORAGE_KEY)
  if (legacy && Array.isArray(legacy.tests)) return legacy.tests

  return []
}

function isValidProfileShape(data) {
  if (!data || typeof data !== 'object') return false
  if (typeof data.name !== 'string') return false
  if (!VALID_GENDERS.includes(String(data.gender).toUpperCase())) return false
  if (data.tests && !Array.isArray(data.tests)) return false
  return true
}

/**
 * Pinia profile store (Setup Store).
 * Profile and tests are independent refs with separate localStorage keys.
 */
export const useProfileStore = defineStore('userStore', () => {
  // State
  const profile = ref(loadProfileFromStorage())
  const tests = ref(loadTestsFromStorage())
  const hasProfile = computed(() => profile.value !== null)

  // Persist migration: write separated data to new keys
  if (profile.value) {
    writeJSON(PROFILE_STORAGE_KEY, profile.value)
    writeJSON(TESTS_STORAGE_KEY, tests.value)
  }

  // Actions
  function loadProfile() {
    profile.value = loadProfileFromStorage()
    tests.value = loadTestsFromStorage()
    return profile.value
  }

  function saveProfile(data) {
    const normalized = normalizeProfile(data)
    normalized.updatedAt = new Date().toISOString()
    profile.value = normalized
    writeJSON(PROFILE_STORAGE_KEY, normalized)
    return normalized
  }

  function clearProfile() {
    localStorage.removeItem(PROFILE_STORAGE_KEY)
    localStorage.removeItem(TESTS_STORAGE_KEY)
    profile.value = null
    tests.value = []
  }

  function appendTest(partial) {
    const entry = {
      date: typeof partial.date === 'string' ? partial.date : new Date().toISOString().slice(0, 10),
      pullup: partial.pullup,
      pushup: partial.pushup,
      squats: partial.squats,
      vups: partial.vups,
      burpees: partial.burpees,
      cooper: partial.cooper,
    }
    tests.value.push(entry)
    tests.value.sort((a, b) => String(a.date).localeCompare(String(b.date)))
    writeJSON(TESTS_STORAGE_KEY, tests.value)
    if (profile.value) saveProfile(profile.value)
    return entry
  }

  function updateTest(index, partial) {
    if (index < 0 || index >= tests.value.length) return null
    const current = tests.value[index]
    const updated = {
      date: typeof partial.date === 'string' ? partial.date : current.date,
      pullup: partial.pullup,
      pushup: partial.pushup,
      squats: partial.squats,
      vups: partial.vups,
      burpees: partial.burpees,
      cooper: partial.cooper,
    }
    tests.value.splice(index, 1, updated)
    tests.value.sort((a, b) => String(a.date).localeCompare(String(b.date)))
    writeJSON(TESTS_STORAGE_KEY, tests.value)
    if (profile.value) saveProfile(profile.value)
    return updated
  }

  function deleteTest(index) {
    if (index < 0 || index >= tests.value.length) return false
    tests.value.splice(index, 1)
    writeJSON(TESTS_STORAGE_KEY, tests.value)
    if (profile.value) saveProfile(profile.value)
    return true
  }

  function exportProfile() {
    const data = profile.value
      ? { ...profile.value, tests: tests.value }
      : { name: '', gender: '', dob: '', email: '', tests: [] }
    return JSON.stringify(data, null, 2)
  }

  function importProfile(data) {
    if (!isValidProfileShape(data)) {
      return { ok: false, error: 'Invalid profile structure' }
    }
    // Check if incoming data is older than current
    const currentUpdatedAt = profile.value?.updatedAt || null
    const incomingUpdatedAt = data.updatedAt || null
    const isOlder =
      currentUpdatedAt && incomingUpdatedAt && incomingUpdatedAt < currentUpdatedAt

    const importedTests = Array.isArray(data.tests)
      ? data.tests.map((t) => ({
          date: typeof t.date === 'string' ? t.date : new Date().toISOString().slice(0, 10),
          pullup: t.pullup,
          pushup: t.pushup,
          squats: t.squats,
          vups: t.vups,
          burpees: t.burpees,
          cooper: Number(t.cooper) || 0,
        }))
      : []
    const migrated = migrateProfile(data)
    const stored = normalizeProfile(migrated)
    stored.updatedAt = new Date().toISOString()
    profile.value = stored
    tests.value = importedTests
    writeJSON(PROFILE_STORAGE_KEY, stored)
    writeJSON(TESTS_STORAGE_KEY, importedTests)
    return { ok: true, profile: stored, isOlder: !!isOlder }
  }

  async function importProfileFromUrl(url) {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        return { ok: false, error: `HTTP ${response.status}: ${response.statusText}` }
      }
      const data = await response.json()
      const result = importProfile(data)

      if (result.ok) {
        saveLastImportUrl(url)
      }

      return result
    } catch (err) {
      return { ok: false, error: err.message || 'Failed to fetch profile' }
    }
  }

  function saveLastImportUrl(url) {
    if (typeof window !== 'undefined' && url && url.trim()) {
      localStorage.setItem(URL_STORAGE_KEY, url.trim())
    }
  }

  function getLastImportUrl() {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(URL_STORAGE_KEY)
  }

  function clearLastImportUrl() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(URL_STORAGE_KEY)
    }
  }

  return {
    // State
    profile,
    tests,
    hasProfile,
    // Methods
    loadProfile,
    saveProfile,
    clearProfile,
    appendTest,
    updateTest,
    deleteTest,
    exportProfile,
    importProfile,
    importProfileFromUrl,
    saveLastImportUrl,
    getLastImportUrl,
    clearLastImportUrl,
  }
})

/**
 * Returns today's date as an ISO string (YYYY-MM-DD) in UTC.
 * @returns {string}
 */
export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

/**
 * Compute integer age (years) of a person born on `dob` at the time of `testDate`.
 * Returns 0 when either value is missing or invalid.
 * @param {string} dob - Birth date as ISO string (YYYY-MM-DD)
 * @param {string} testDate - Test date as ISO string (YYYY-MM-DD)
 * @returns {number}
 */
export function ageAtDate(dob, testDate) {
  if (!dob || !testDate) return 0
  const birth = new Date(dob)
  const test = new Date(testDate)
  if (isNaN(birth.getTime()) || isNaN(test.getTime())) return 0
  let age = test.getUTCFullYear() - birth.getUTCFullYear()
  const m = test.getUTCMonth() - birth.getUTCMonth()
  if (m < 0 || (m === 0 && test.getUTCDate() < birth.getUTCDate())) age--
  return age < 0 ? 0 : age
}
