const movementVersions = {
  pullup: [
    { value: "c", label: "Completa" },
    { value: "n", label: "Negativa" },
    { value: "l", label: "Ligas" },
    { value: "m", label: "Media" },
  ],
  pushup: [
    { value: "c", label: "Completa" },
    { value: "m", label: "Media" },
    { value: "r", label: "Reverencia" },
  ],
  squats: [{ value: "c", label: "Completa" }],
  vups: [
    { value: "c", label: "Completa" },
    { value: "m", label: "Media" },
  ],
  burpees: [
    { value: "c", label: "Completa" },
    { value: "sf", label: "Sin Flexión" },
  ],
};
const EXERCISE_KEYS = Object.keys(movementVersions);
const COOPER_TRIP_SIZE_METERS = 320;
const STORAGE_KEY = "performanceTestData";

function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (_) {}
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (_) {
    return null;
  }
}

hydrateSelect = (id, options) => {
  const select = document.getElementById(id);
  options.forEach((opt) => {
    const o = document.createElement("option");
    o.value = opt.value;
    o.textContent = opt.label;
    select.appendChild(o);
  });
};

function fillResultDate() {
  const now = new Date();
  const formatted = now.toLocaleString("es-MX", {
    dateStyle: "medium",
  });
  document.getElementById("result-date").textContent = formatted;
}

function fillAthleteInfo(data) {
  const { name, age, gender } = data;
  document.getElementById("result-name").textContent = name || "—";
  document.getElementById("result-age").textContent = age || "—";
  document.getElementById("result-gender").textContent =
    gender === "m" ? "Masculino" : gender === "f" ? "Femenino" : "—";
}

function getData() {
  const name = document.getElementById("full-name").value.trim();
  const gender = document.querySelector('input[name="gender"]:checked')?.value;
  const age = parseInt(document.getElementById("age").value, 10) || 0;
  const exercises = EXERCISE_KEYS.reduce((acc, key) => {
    acc[key] = readExercise(key);
    return acc;
  }, {});
  const laps = parseFloat(document.getElementById("laps").value) || 0.0;

  return { name, gender, age, exercises, laps };
}

function readExercise(key) {
  const repsEl = document.getElementById(`${key}-reps`);
  const verEl = document.getElementById(`${key}-version`);
  return {
    reps: parseInt(repsEl?.value, 10) || 0,
    version: verEl?.value || "",
    label: verEl?.selectedOptions[0]?.textContent || "",
  };
}

function fillResultsTable(data) {
  const { exercises } = data;
  const tableBody = document.getElementById("results-table-body");
  tableBody.innerHTML = "";

  const frag = document.createDocumentFragment();
  EXERCISE_KEYS.forEach((exercise) => {
    const { reps, label } = exercises[exercise];
    const name =
      exercise.charAt(0).toUpperCase() +
      exercise.slice(1).replace("ups", "-ups");

    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="py-3 px-4">
        <div class="d-flex align-items-center">
          <strong>${name}</strong>
        </div>
      </td>
      <td class="text-center py-3">
        <span class="reps-number">${reps}</span>
      </td>
      <td class="text-center py-3">
        <span class="badge bg-primary">${label}</span>
      </td>
    `;
    frag.appendChild(row);
  });
  tableBody.appendChild(frag);
}

function fillCooper({ gender, age, laps }) {
  const cooperDistance = document.getElementById("cooper-distance-result");
  const cooperResult = document.getElementById("cooper-result");
  const vo2MaxSpan = document.getElementById("vo2-max");

  const levels = {
    1: { classes: ["text-danger"], text: "Muy bajo" },
    2: { classes: ["text-warning"], text: "Bajo" },
    3: { classes: ["text-secondary"], text: "Normal" },
    4: { classes: ["text-primary"], text: "Bueno" },
    5: { classes: ["text-success"], text: "Excelente" },
  };

  const meters = laps * COOPER_TRIP_SIZE_METERS;
  const kilometers = (meters / 1000).toFixed(2);

  if (meters <= 0) {
    cooperDistance.textContent = '0 km';
    cooperResult.className = "h2 fw-bold text-muted";
    cooperResult.textContent = "—";
    vo2MaxSpan.textContent = "";
    return;
  }

  const level = evaluateCooper(meters, age, gender);
  const { classes, text } = levels[level];
  const vo2Max = Math.round(calculateVO2Max(meters) * 100) / 100;

  cooperDistance.textContent = `${kilometers} km`;
  cooperResult.className = ["h2", "fw-bold", ...classes].join(" ");
  cooperResult.textContent = text;
  vo2MaxSpan.textContent = `vo2Max ${vo2Max} ml/kg/min`;
}

const form = document.getElementById("performance-test-form");
form.addEventListener("submit", (e) => {
  if (!form.checkValidity()) {
    e.preventDefault();
    form.reportValidity();
    return;
  }

  e.preventDefault();

  const data = getData();
  saveData(data);

  fillResultDate();
  fillAthleteInfo(data);
  fillResultsTable(data);
  fillCooper(data);

  const results = document.getElementById("results-card");
  results.classList.remove("d-none");
  document.getElementById("screenshot-wrapper").classList.remove("d-none");
  results.scrollIntoView({ behavior: "smooth" });
});

form.addEventListener("input", (ev) => {
  const el = ev.target;
  if (el.willValidate) {
    el.classList.toggle("is-invalid", !el.checkValidity());
    el.classList.toggle("is-valid", el.checkValidity());
  }
});

document.getElementById("screenshot").addEventListener("click", (e) => {
  e.preventDefault();

  const card = document.getElementById("results-card");
  html2canvas(card, {
    backgroundColor: "#ffffff",
  }).then((canvas) => {
    // Crear imagen
    const link = document.createElement("a");
    link.download = `test-${new Date().toISOString().slice(0, 10)}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
});

function populateForm(data) {
  if (!data) return;
  const { name, gender, age, laps, exercises } = data;

  const nameEl = document.getElementById("full-name");
  if (nameEl) nameEl.value = name || "";

  const ageEl = document.getElementById("age");
  if (ageEl) ageEl.value = age || "";

  const lapsEl = document.getElementById("laps");
  if (lapsEl) lapsEl.value = laps || "";

  if (gender) {
    const gEl = document.querySelector(`input[name="gender"][value="${gender}"]`);
    if (gEl) gEl.checked = true;
  }

  if (exercises) {
    EXERCISE_KEYS.forEach((k) => {
      const ex = exercises[k];
      if (!ex) return;
      const repsEl = document.getElementById(`${k}-reps`);
      const verEl = document.getElementById(`${k}-version`);
      if (repsEl) repsEl.value = ex.reps || 0;
      if (verEl && ex.version) verEl.value = ex.version;
    });
  }
}


function clearExerciseReps() {
  EXERCISE_KEYS.forEach((k) => {
    const repsEl = document.getElementById(`${k}-reps`);
    const verEl = document.getElementById(`${k}-version`);
    if (repsEl) {
      repsEl.value = "";
      repsEl.classList.remove("is-valid", "is-invalid");
    }
    if (verEl) {
      verEl.selectedIndex = 0;
      verEl.classList.remove("is-valid", "is-invalid");
    }
  });

  const lapsEl = document.getElementById("laps");
  if (lapsEl) {
    lapsEl.value = "";
    lapsEl.classList.remove("is-valid", "is-invalid");
  }
}

function init() {
  // Hydrate select elements for each exercise version
  Object.entries(movementVersions).forEach(([exercise, options]) => {
    hydrateSelect(`${exercise}-version`, options);
  });

  const saved = loadData();
  if (saved) {
    populateForm(saved);
  }

  document.getElementById("clear-exercises")?.addEventListener("click", clearExerciseReps);

}

document.addEventListener("DOMContentLoaded", init);
