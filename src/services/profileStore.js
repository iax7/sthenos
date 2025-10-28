// Responsibility: load, save, clear profile data from localStorage.

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

const STORAGE_KEY = "user_profile_v1";
const VALID_GENDERS = ['M', 'F'];
const DEFAULT_PROFILE = { name: "", gender: "", age: 0, tests: [] };

/**
 * Create a test metric object.
 * @param {number} reps
 * @param {string} version
 * @returns {{reps: number, version: string}}
 */
export function createTestMetric(reps, version) {
  const repetitions = Number(reps) || 0;
  const ver = (version || "").trim()
  return { reps: repetitions, version: ver };
}

/**
 * Load profile from storage.
 * @returns {UserProfile|null}
 */
export function loadProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return {
      name: typeof data.name === "string" ? data.name : "",
      gender: typeof data.gender === "string" ? data.gender.toUpperCase() : "",
      age: typeof data.age === "number" ? data.age : Number(data.age) || 0,
      tests: Array.isArray(data.tests) ? data.tests : [],
    };
  } catch (e) {
    console.warn("[profileStore] Failed to load:", e);
    return null;
  }
}

/**
 * Persist profile.
 * @param {UserProfile} profile
 * @returns {UserProfile} normalized stored profile
 */
export function saveProfile(profile) {
  // Load existing to preserve tests when not provided explicitly
  let existing = null;
  try {
    existing = loadProfile();
  } catch (_) {}
  const incomingHasTests = Array.isArray(profile.tests);
  const normalized = {
    name: (profile.name || "").trim(),
    gender: String(profile.gender || "").toUpperCase(),
    age: Number(profile.age) || 0,
    tests: incomingHasTests ? profile.tests : existing?.tests || [],
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}

export function clearProfile() {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Append a test entry (exercise record) to profile.tests
 * @param {Object} partial - expects shape matching exercise record from ExerciseForm
 */
export function appendTest(partial) {
  const profile = loadProfile() || DEFAULT_PROFILE;
  const entry = {
    date:
      typeof partial.date === "string"
        ? partial.date
        : new Date().toISOString().slice(0, 10),
    pullup: partial.pullup,
    pushup: partial.pushup,
    squats: partial.squats,
    vups: partial.vups,
    burpees: partial.burpees,
    cooper: partial.cooper,
  };
  profile.tests.push(entry);
  // Keep tests sorted by date ascending
  profile.tests.sort((a, b) => String(a.date).localeCompare(String(b.date)));
  saveProfile(profile);
  return entry;
}

/**
 * Update a test entry at index
 * @param {number} index
 * @param {Object} partial new values
 */
export function updateTest(index, partial) {
  const profile = loadProfile();
  if (
    !profile ||
    !Array.isArray(profile.tests) ||
    index < 0 ||
    index >= profile.tests.length
  )
    return null;
  const current = profile.tests[index];
  const updated = {
    date: typeof partial.date === "string" ? partial.date : current.date,
    pullup: partial.pullup,
    pushup: partial.pushup,
    squats: partial.squats,
    vups: partial.vups,
    burpees: partial.burpees,
    cooper: partial.cooper,
  };
  profile.tests.splice(index, 1, updated);
  // Re-sort after update
  profile.tests.sort((a, b) => String(a.date).localeCompare(String(b.date)));
  saveProfile(profile);
  return updated;
}

/**
 * Delete test at index
 * @param {number} index
 * @returns {boolean}
 */
export function deleteTest(index) {
  const profile = loadProfile();
  if (
    !profile ||
    !Array.isArray(profile.tests) ||
    index < 0 ||
    index >= profile.tests.length
  )
    return false;
  profile.tests.splice(index, 1);
  saveProfile(profile);
  return true;
}

/**
 * Get raw profile JSON string (pretty printed) for download.
 * @returns {string}
 */
export function getProfileData() {
  const profile = loadProfile();
  return JSON.stringify(
    profile || DEFAULT_PROFILE,
    null,
    2,
  );
}

/**
 * Validate a parsed profile object shape.
 * @param {any} data
 * @returns {boolean}
 */
function isValidProfileShape(data) {
  if (!data || typeof data !== "object") return false;
  if (typeof data.name !== "string") return false;
  if (!VALID_GENDERS.includes(String(data.gender).toUpperCase())) return false;
  if (typeof data.age !== "number" && isNaN(Number(data.age))) return false;
  if (data.tests && !Array.isArray(data.tests)) return false;
  return true;
}

/**
 * Import profile replacing existing data.
 * @param {Object} data parsed JSON
 * @returns {{ok:boolean,error?:string,profile?:Object}}
 */
export function importProfile(data) {
  if (!isValidProfileShape(data)) {
    return { ok: false, error: "Invalid profile structure" };
  }
  // normalize tests metrics to expected shape
  if (Array.isArray(data.tests)) {
    data.tests = data.tests.map((t) => ({
      date:
        typeof t.date === "string"
          ? t.date
          : new Date().toISOString().slice(0, 10),
      pullup: t.pullup,
      pushup: t.pushup,
      squats: t.squats,
      vups: t.vups,
      burpees: t.burpees,
      cooper: Number(t.cooper) || 0,
    }));
  }
  const stored = saveProfile({
    name: data.name,
    gender: data.gender,
    age: Number(data.age) || 0,
    tests: Array.isArray(data.tests) ? data.tests : [],
  });
  return { ok: true, profile: stored };
}
