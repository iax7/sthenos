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
import AppCard from "@/components/ui/AppCard.vue";
import ChartStats from "@/components/HomeChartStats.vue";
import {
  filterTestsByMetric,
  calculateStats,
} from "@/services/exerciseCollectionService.js";
import {
  EXERCISES,
  getExerciseType,
} from "@/services/excercises.js";
import { useProfileStore } from "@/composables/useProfileStore.js";
import { getGradientColors } from "@/services/chartColors.js";

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

const chartData = computed(() => {
  const data = selectedData.value;
  if (!data || !data.length) {
    return {
      labels: [],
      datasets: [],
    };
  }

  const [baseColor, startColor, endColor, pointColor] = getGradientColors(
    stats.value.pct,
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
        pointRadius: 6,
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
  const [baseColor] = getGradientColors(stats.value.pct);
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 750,
      easing: 'easeInOutQuart',
    },
    transitions: {
      active: {
        animation: {
          duration: 300,
        },
      },
    },
    layout: {
      padding: {
        top: 26, // Add some top padding for better label visibility
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        cornerRadius: 8,
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 12 },
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
            return `${dataPoint.reps} reps${versionLabel} = ${context.parsed.y} pts`;
          },
          afterLabel: (context) => {
            const idx = context.dataIndex;
            if (idx > 0) {
              const current = context.parsed.y;
              const previous = selectedData.value[idx - 1]?.value;
              if (previous != null) {
                const change = current - previous;
                const sign = change >= 0 ? '+' : '';
                return `${sign}${change} pts vs previous`;
              }
            }
            return '';
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
        grid: {
          color: "rgba(209, 213, 219, 0.2)",
          lineWidth: 1,
        },
        ticks: {
          callback: (value) => (Number.isInteger(value) ? value : ""),
          stepSize: 1,
          color: '#6b7280',
          font: { size: 11 },
        },
      },
      x: {
        grid: {
          display: true,
          color: "rgba(209, 213, 219, 0.15)",
        },
        ticks: {
          color: '#6b7280',
          font: { size: 11 },
        },
      },
    },
  };
});
</script>

<template>
  <AppCard>
    <div class="mb-4 flex items-center justify-between gap-3">
      <h2>{{ t("dashboard.chart.title") }}</h2>
      <label class="sr-only" for="metric-select">{{ t("dashboard.chart.selectMetric") }}</label>
      <select id="metric-select" v-model="selectedMetric"
        class="form-input min-w-[140px] cursor-pointer transition-colors hover:border-blue-400 focus:ring-2 focus:ring-blue-500"
        aria-label="Select exercise metric">
        <option v-for="m in EXERCISES" :key="m.key" :value="m.key">
          {{ m.label }}
        </option>
      </select>
    </div>
    <div v-if="!selectedData || selectedData.length < 2" class="py-8 text-center">
      <p class="text-sm text-gray-500">{{ t("dashboard.chart.notEnoughData") }}</p>
      <p v-if="selectedData && selectedData.length === 1" class="mt-1 text-xs text-gray-400">
        {{ t("dashboard.chart.needOneMore") }}
      </p>
      <p v-else-if="!selectedData || selectedData.length === 0" class="mt-1 text-xs text-gray-400">
        {{ t("dashboard.chart.needTwoTests") }}
      </p>
    </div>
    <div v-else class="transition-opacity duration-300">
      <div class="h-64 sm:h-72 md:h-80 w-full">
        <Line :data="chartData" :options="chartOptions" />
      </div>
      <ChartStats :stats="stats" />
    </div>
  </AppCard>
</template>
