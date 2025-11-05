<script setup>
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { Line } from "vue-chartjs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import Card from "@/components/ui/Card.vue";
import ChartStats from "@/components/ChartStats.vue";
import {
  filterTestsByMetric,
  calculateStats,
} from "@/services/exerciseCollectionService.js";
import {
  EXERCISES,
  getExerciseType,
} from "@/services/excercises.js";
import { useProfileStore } from "@/composables/useProfileStore.js";

const { tests } = useProfileStore();

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartDataLabels,
);

const { t } = useI18n();

// [ Base, 60% opacity, 25% opacity, Darker ]
const GRADIENT_COLORS = {
  blue: ["#2563eb", "#2563eb99", "#2563eb40", "#1d4ed8"],
  red: ["#ef4444", "#ef444499", "#ef444440", "#b91c1c"],
  green: ["#34d399", "#34d39999", "#34d39940", "#10b981"],
};

const selectedMetric = ref(EXERCISES[0].key);

const selectedData = computed(() => {
  return filterTestsByMetric(tests.value, selectedMetric.value) || [];
});

const stats = computed(() => calculateStats(selectedData.value));

function formatDateLabel(dateStr) {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length < 2) return dateStr;
  const [y, m] = parts;
  return y.slice(-2) + "-" + m;
}

/**
 * Returns gradient colors based on delta value
 * @param {number} delta
 * @returns {[string, string, string, string]} Array of colors: [baseColor, startColor, endColor, pointColor]
 */
function getGradientColors(delta) {
  return delta < 0 ? GRADIENT_COLORS["red"] : GRADIENT_COLORS["blue"];
}

const chartData = computed(() => {
  const data = selectedData.value;
  if (!data || !data.length) {
    return {
      labels: [],
      datasets: [],
    };
  }

  const [baseColor, startColor, endColor, pointColor] = getGradientColors(
    stats.value.delta,
  );

  const gradientFill = (ctx) => {
    const chart = ctx.chart;
    const { ctx: canvasCtx, chartArea } = chart;
    if (!chartArea) return "rgba(37,99,235,0.1)";
    const grad = canvasCtx.createLinearGradient(
      0,
      chartArea.top,
      0,
      chartArea.bottom,
    );
    grad.addColorStop(0, startColor);
    grad.addColorStop(1, endColor);
    return grad;
  };

  return {
    labels: data.map((d) => formatDateLabel(d.date)),
    datasets: [
      {
        label: getExerciseType(selectedMetric.value)?.label || "",
        data: data.map((d) => d.value),
        borderColor: baseColor,
        backgroundColor: gradientFill,
        fill: true,
        tension: 0.3,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: pointColor,
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
      },
    ],
  };
});

const chartOptions = computed(() => {
  if (!stats.value) return {};
  const [baseColor] = getGradientColors(stats.value.delta);
  return {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 25, // Add some top padding for better label visibility
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            const dataPoint = selectedData.value[context.dataIndex];
            const metric = getExerciseType(selectedMetric.value);
            let versionLabel = "";
            if (dataPoint?.version && metric?.versions) {
              const versionObj = metric.versions.find(
                (v) => v.value === dataPoint.version,
              );
              versionLabel = versionObj
                ? ` (${t(versionObj.labelKey)})`
                : ` (${dataPoint.version})`;
            }
            return `${context.parsed.y}${versionLabel}`;
          },
        },
      },
      datalabels: {
        anchor: "end",
        align: "end",
        color: baseColor,
        font: { weight: "bold", size: 12 },
        formatter: (value) => (value != null ? value : ""),
        display: true,
        clip: false,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: { color: "rgba(209, 213, 219, 0.3)" },
        ticks: {
          callback: (value) => (Number.isInteger(value) ? value : ""),
          stepSize: 1,
        },
      },
      x: {
        grid: { display: true },
      },
    },
  };
});
</script>

<template>
  <Card>
    <div class="mb-4 flex items-center justify-between">
      <h2>{{ t("dashboard.chart.title") }}</h2>
      <select v-model="selectedMetric" class="form-input">
        <option v-for="m in EXERCISES" :key="m.key" :value="m.key">
          {{ m.label }}
        </option>
      </select>
    </div>
    <div
      v-if="!selectedData || selectedData.length < 2"
      class="text-sm text-gray-500"
    >
      {{ t("dashboard.chart.notEnoughData") }}
    </div>
    <div v-else>
      <div class="h-60 w-full">
        <Line :data="chartData" :options="chartOptions" />
      </div>
      <ChartStats :stats="stats" />
    </div>
  </Card>
</template>
