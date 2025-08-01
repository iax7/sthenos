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
    { value: "i", label: "Inclinada" },
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

hydrateSelect = (id, options) => {
  const select = document.getElementById(id);
  options.forEach((opt) => {
    const o = document.createElement("option");
    o.value = opt.value;
    o.textContent = opt.label;
    select.appendChild(o);
  });
};

// Hydrate select elements for each exercise version
Object.entries(movementVersions).forEach(([exercise, options]) => {
  hydrateSelect(`${exercise}-version`, options);
});

function fillResultDate() {
  const now = new Date();
  const formatted = now.toLocaleString("es-MX", {
    dateStyle: "medium",
  });
  document.getElementById("result-date").textContent = formatted;
}

function fillAthleteInfo() {
  const name = document.getElementById("full-name").value.trim();
  const age = document.getElementById("age").value;
  const gender = document.querySelector('input[name="gender"]:checked')?.value;

  document.getElementById("result-name").textContent = name || "—";
  document.getElementById("result-age").textContent = age || "—";
  document.getElementById("result-gender").textContent =
    gender === "m" ? "Masculino" : gender === "f" ? "Femenino" : "—";
}

function fillResultsTable() {
  const tableBody = document.getElementById("results-table-body");
  tableBody.innerHTML = ""; // Limpia los resultados previos

  Object.keys(movementVersions).forEach((exercise) => {
    const name =
      exercise.charAt(0).toUpperCase() +
      exercise.slice(1).replace("ups", "-ups"); // Formatting nombre
    const repsInput = document.getElementById(`${exercise}-reps`);
    const versionSelect = document.getElementById(`${exercise}-version`);

    const reps = repsInput?.value || "0";
    const versionLabel = versionSelect?.selectedOptions[0]?.textContent || "";

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
        <span class="badge bg-primary">${versionLabel}</span>
      </td>
    `;

    tableBody.appendChild(row);
  });
}

function fillCooper(gender, age, laps) {
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

  const tripSize = 320; // meters
  const meters = laps * tripSize;
  const level = evaluateCooper(meters, age, gender);
  const { classes, text } = levels[level];
  const vo2Max = Math.round(calculateVO2Max(meters) * 100) / 100;

  cooperDistance.textContent = `${meters / 1000} km`;
  cooperResult.className = ["h2", "fw-bold", ...classes].join(" ");
  cooperResult.textContent = text;
  vo2MaxSpan.textContent = `vo2Max ${vo2Max} ml/kg/min`;
}

document.getElementById("calculate").addEventListener("click", (event) => {
  event.preventDefault();

  const gender = document.querySelector('input[name="gender"]:checked').value;
  const age = document.getElementById("age").value;
  const laps = parseFloat(document.getElementById("laps").value);

  if (!gender || !age) {
    alert("Por favor, selecciona un género y una edad");
    return;
  }
  if (!laps) {
    alert("Por favor, ingresa el número de vueltas");
    return;
  }

  fillResultDate();
  fillAthleteInfo();
  fillResultsTable();
  fillCooper(gender, age, laps);

  const results = document.getElementById("results-card");
  results.classList.remove("d-none");
  document.getElementById("screenshot-wrapper").classList.remove("d-none");

  results.scrollIntoView({ behavior: "smooth" });
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
