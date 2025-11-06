// Composable for reactive profile management with localStorage persistence.

import { ref, computed, readonly } from 'vue'

/**
 * @typedef {Object} UserProfile
 * @property {string} name
 * @property {string} gender - 'M' or 'F'
 * @property {number} age
 * @property {TestEntry[]=} tests
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

const STORAGE_KEY = 'user_profile_v1'
const URL_STORAGE_KEY = 'profile_import_url'
const VALID_GENDERS = ['M', 'F']
const DEFAULT_PROFILE = { name: '', gender: '', age: 0, tests: [] }

// Shared reactive state
const profile = ref(null)

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

/**
 * Load profile from storage.
 * @returns {UserProfile|null}
 */
function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    return {
      name: typeof data.name === 'string' ? data.name : '',
      gender: typeof data.gender === 'string' ? data.gender.toUpperCase() : '',
      age: typeof data.age === 'number' ? data.age : Number(data.age) || 0,
      tests: Array.isArray(data.tests) ? data.tests : [],
    }
  } catch (e) {
    console.warn('[useProfileStore] Failed to load:', e)
    return null
  }
}

/**
 * Persist profile to storage and update reactive state.
 * @param {UserProfile} data
 * @returns {UserProfile} normalized stored profile
 */
function saveToStorage(data) {
  // Load existing to preserve tests when not provided explicitly
  let existing = null
  try {
    existing = loadFromStorage()
  } catch (_) {}
  const incomingHasTests = Array.isArray(data.tests)
  const normalized = {
    name: (data.name || '').trim(),
    gender: String(data.gender || '').toUpperCase(),
    age: Number(data.age) || 0,
    tests: incomingHasTests ? data.tests : existing?.tests || [],
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized))
  profile.value = normalized
  // Dispatch event for backward compatibility
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('profile-updated'))
  }
  return normalized
}

/**
 * Validate a parsed profile object shape.
 * @param {any} data
 * @returns {boolean}
 */
function isValidProfileShape(data) {
  if (!data || typeof data !== 'object') return false
  if (typeof data.name !== 'string') return false
  if (!VALID_GENDERS.includes(String(data.gender).toUpperCase())) return false
  if (typeof data.age !== 'number' && isNaN(Number(data.age))) return false
  if (data.tests && !Array.isArray(data.tests)) return false
  return true
}

/**
 * Composable for profile store operations.
 * @returns {Object}
 */
export function useProfileStore() {
  // Initialize on first use
  if (profile.value === null) {
    profile.value = loadFromStorage()
  }

  const tests = computed(() => profile.value?.tests || [])
  const hasProfile = computed(() => profile.value !== null)

  /**
   * Load profile from storage and update reactive state.
   * @returns {UserProfile|null}
   */
  function loadProfile() {
    profile.value = loadFromStorage()
    return profile.value
  }

  /**
   * Persist profile.
   * @param {UserProfile} data
   * @returns {UserProfile}
   */
  function saveProfile(data) {
    return saveToStorage(data)
  }

  /**
   * Clear profile from storage and reset reactive state.
   */
  function clearProfile() {
    localStorage.removeItem(STORAGE_KEY)
    profile.value = null
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('profile-updated'))
    }
  }

  /**
   * Append a test entry (exercise record) to profile.tests
   * @param {Object} partial - expects shape matching exercise record from ExerciseForm
   * @returns {TestEntry} the created entry
   */
  function appendTest(partial) {
    const currentProfile = profile.value || DEFAULT_PROFILE
    const entry = {
      date: typeof partial.date === 'string' ? partial.date : new Date().toISOString().slice(0, 10),
      pullup: partial.pullup,
      pushup: partial.pushup,
      squats: partial.squats,
      vups: partial.vups,
      burpees: partial.burpees,
      cooper: partial.cooper,
    }
    currentProfile.tests.push(entry)
    // Keep tests sorted by date ascending
    currentProfile.tests.sort((a, b) => String(a.date).localeCompare(String(b.date)))
    saveToStorage(currentProfile)
    return entry
  }

  /**
   * Update a test entry at index
   * @param {number} index
   * @param {Object} partial new values
   * @returns {TestEntry|null}
   */
  function updateTest(index, partial) {
    if (
      !profile.value ||
      !Array.isArray(profile.value.tests) ||
      index < 0 ||
      index >= profile.value.tests.length
    )
      return null
    const current = profile.value.tests[index]
    const updated = {
      date: typeof partial.date === 'string' ? partial.date : current.date,
      pullup: partial.pullup,
      pushup: partial.pushup,
      squats: partial.squats,
      vups: partial.vups,
      burpees: partial.burpees,
      cooper: partial.cooper,
    }
    profile.value.tests.splice(index, 1, updated)
    // Re-sort after update
    profile.value.tests.sort((a, b) => String(a.date).localeCompare(String(b.date)))
    saveToStorage(profile.value)
    return updated
  }

  /**
   * Delete test at index
   * @param {number} index
   * @returns {boolean}
   */
  function deleteTest(index) {
    if (
      !profile.value ||
      !Array.isArray(profile.value.tests) ||
      index < 0 ||
      index >= profile.value.tests.length
    )
      return false
    profile.value.tests.splice(index, 1)
    saveToStorage(profile.value)
    return true
  }

  /**
   * Get raw profile JSON string (pretty printed) for download.
   * @returns {string}
   */
  function getProfileData() {
    return JSON.stringify(profile.value || DEFAULT_PROFILE, null, 2)
  }

  /**
   * Import profile replacing existing data.
   * @param {Object} data parsed JSON
   * @returns {{ok:boolean,error?:string,profile?:Object}}
   */
  function importProfile(data) {
    if (!isValidProfileShape(data)) {
      return { ok: false, error: 'Invalid profile structure' }
    }
    // normalize tests metrics to expected shape
    if (Array.isArray(data.tests)) {
      data.tests = data.tests.map((t) => ({
        date: typeof t.date === 'string' ? t.date : new Date().toISOString().slice(0, 10),
        pullup: t.pullup,
        pushup: t.pushup,
        squats: t.squats,
        vups: t.vups,
        burpees: t.burpees,
        cooper: Number(t.cooper) || 0,
      }))
    }
    const stored = saveToStorage({
      name: data.name,
      gender: data.gender,
      age: Number(data.age) || 0,
      tests: Array.isArray(data.tests) ? data.tests : [],
    })
    return { ok: true, profile: stored }
  }

  /**
   * Import profile from a URL.
   * @param {string} url - The URL to fetch the profile JSON from
   * @returns {Promise<{ok:boolean,error?:string,profile?:Object}>}
   */
  async function importProfileFromUrl(url) {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        return { ok: false, error: `HTTP ${response.status}: ${response.statusText}` }
      }
      const data = await response.json()
      const result = importProfile(data)

      // Save URL to localStorage if import was successful
      if (result.ok) {
        saveLastImportUrl(url)
      }

      return result
    } catch (err) {
      return { ok: false, error: err.message || 'Failed to fetch profile' }
    }
  }

  /**
   * Save the last used import URL to localStorage.
   * @param {string} url
   */
  function saveLastImportUrl(url) {
    if (typeof window !== 'undefined' && url && url.trim()) {
      localStorage.setItem(URL_STORAGE_KEY, url.trim())
    }
  }

  /**
   * Get the last used import URL from localStorage.
   * @returns {string|null}
   */
  function getLastImportUrl() {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(URL_STORAGE_KEY)
  }

  /**
   * Clear the saved import URL from localStorage.
   */
  function clearLastImportUrl() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(URL_STORAGE_KEY)
    }
  }

  return {
    // Reactive state (readonly to prevent direct mutation)
    profile: readonly(profile),
    tests,
    hasProfile,
    // Methods
    loadProfile,
    saveProfile,
    clearProfile,
    appendTest,
    updateTest,
    deleteTest,
    getProfileData,
    importProfile,
    importProfileFromUrl,
    saveLastImportUrl,
    getLastImportUrl,
    clearLastImportUrl,
    createTestMetric,
  }
}

// Legacy exports for backward compatibility
// These can be removed once all components migrate to the composable
export function loadProfile() {
  return loadFromStorage()
}

export function saveProfile(data) {
  const result = saveToStorage(data)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('profile-updated'))
  }
  return result
}

export function clearProfile() {
  localStorage.removeItem(STORAGE_KEY)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('profile-updated'))
  }
}

export function appendTest(partial) {
  const currentProfile = loadFromStorage() || DEFAULT_PROFILE
  const entry = {
    date: typeof partial.date === 'string' ? partial.date : new Date().toISOString().slice(0, 10),
    pullup: partial.pullup,
    pushup: partial.pushup,
    squats: partial.squats,
    vups: partial.vups,
    burpees: partial.burpees,
    cooper: partial.cooper,
  }
  currentProfile.tests.push(entry)
  currentProfile.tests.sort((a, b) => String(a.date).localeCompare(String(b.date)))
  saveProfile(currentProfile)
  return entry
}

export function updateTest(index, partial) {
  const currentProfile = loadFromStorage()
  if (
    !currentProfile ||
    !Array.isArray(currentProfile.tests) ||
    index < 0 ||
    index >= currentProfile.tests.length
  )
    return null
  const current = currentProfile.tests[index]
  const updated = {
    date: typeof partial.date === 'string' ? partial.date : current.date,
    pullup: partial.pullup,
    pushup: partial.pushup,
    squats: partial.squats,
    vups: partial.vups,
    burpees: partial.burpees,
    cooper: partial.cooper,
  }
  currentProfile.tests.splice(index, 1, updated)
  currentProfile.tests.sort((a, b) => String(a.date).localeCompare(String(b.date)))
  saveProfile(currentProfile)
  return updated
}

export function deleteTest(index) {
  const currentProfile = loadFromStorage()
  if (
    !currentProfile ||
    !Array.isArray(currentProfile.tests) ||
    index < 0 ||
    index >= currentProfile.tests.length
  )
    return false
  currentProfile.tests.splice(index, 1)
  saveProfile(currentProfile)
  return true
}

export function getProfileData() {
  const currentProfile = loadFromStorage()
  return JSON.stringify(currentProfile || DEFAULT_PROFILE, null, 2)
}

export function importProfile(data) {
  if (!isValidProfileShape(data)) {
    return { ok: false, error: 'Invalid profile structure' }
  }
  if (Array.isArray(data.tests)) {
    data.tests = data.tests.map((t) => ({
      date: typeof t.date === 'string' ? t.date : new Date().toISOString().slice(0, 10),
      pullup: t.pullup,
      pushup: t.pushup,
      squats: t.squats,
      vups: t.vups,
      burpees: t.burpees,
      cooper: Number(t.cooper) || 0,
    }))
  }
  const stored = saveProfile({
    name: data.name,
    gender: data.gender,
    age: Number(data.age) || 0,
    tests: Array.isArray(data.tests) ? data.tests : [],
  })
  return { ok: true, profile: stored }
}

