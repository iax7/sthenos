// profileStore.js
// Responsibility: load, save, clear profile data from localStorage.
// Simplified: UI layer handles locking & hash if needed; store persists raw profile.

/**
 * @typedef {Object} TestMetric
 * @property {number} reps
 * @property {string} version
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
 * @typedef {Object} UserProfile
 * @property {string} name
 * @property {string} gender - 'M' or 'F'
 * @property {number} age
 * @property {TestEntry[]=} tests
 */

const STORAGE_KEY = "user_profile_v1";

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
  const profile = loadProfile() || { name: "", gender: "", age: 0, tests: [] };
  const entry = {
    date:
      typeof partial.date === "string"
        ? partial.date
        : new Date().toISOString().slice(0, 10),
    pullup: {
      reps: Number(partial.pullUps) || 0,
      version: (partial.pullUpsVersion || "").trim(),
    },
    pushup: {
      reps: Number(partial.pushUps) || 0,
      version: (partial.pushUpsVersion || "").trim(),
    },
    squats: {
      reps: Number(partial.squats) || 0,
      version: (partial.squatsVersion || "").trim(),
    },
    vups: {
      reps: Number(partial.vups) || 0,
      version: (partial.vupsVersion || "").trim(),
    },
    burpees: {
      reps: Number(partial.burpees) || 0,
      version: (partial.burpeesVersion || "").trim(),
    },
    cooper: Number(partial.laps) || 0,
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
    pullup: {
      reps: Number(partial.pullUps ?? current.pullup.reps) || 0,
      version: (partial.pullUpsVersion ?? current.pullup.version ?? "").trim(),
    },
    pushup: {
      reps: Number(partial.pushUps ?? current.pushup.reps) || 0,
      version: (partial.pushUpsVersion ?? current.pushup.version ?? "").trim(),
    },
    squats: {
      reps: Number(partial.squats ?? current.squats.reps) || 0,
      version: (partial.squatsVersion ?? current.squats.version ?? "").trim(),
    },
    vups: {
      reps: Number(partial.vups ?? current.vups.reps) || 0,
      version: (partial.vupsVersion ?? current.vups.version ?? "").trim(),
    },
    burpees: {
      reps: Number(partial.burpees ?? current.burpees.reps) || 0,
      version: (partial.burpeesVersion ?? current.burpees.version ?? "").trim(),
    },
    cooper: Number(partial.laps ?? current.cooper) || 0,
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
    profile || { name: "", gender: "", age: 0, tests: [] },
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
  if (!["M", "F"].includes(String(data.gender).toUpperCase())) return false;
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
      pullup: t.pullup || {
        reps: Number(t.pullUps || t.pullup?.reps) || 0,
        version: (t.pullUpsVersion || t.pullup?.version || "").trim(),
      },
      pushup: t.pushup || {
        reps: Number(t.pushUps || t.pushup?.reps) || 0,
        version: (t.pushUpsVersion || t.pushup?.version || "").trim(),
      },
      squats: t.squats || {
        reps: Number(t.squats?.reps || t.squats) || 0,
        version: (t.squatsVersion || t.squats?.version || "").trim(),
      },
      vups: t.vups || {
        reps: Number(t.vups?.reps || t.vups) || 0,
        version: (t.vupsVersion || t.vups?.version || "").trim(),
      },
      burpees: t.burpees || {
        reps: Number(t.burpees?.reps || t.burpees) || 0,
        version: (t.burpeesVersion || t.burpees?.version || "").trim(),
      },
      cooper: Number(t.cooper ?? t.laps) || 0,
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
