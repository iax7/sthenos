<script setup>
import { computed, ref } from "vue";
import { storeToRefs } from 'pinia';
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
  filterTestsByTotalScore,
  calculateStats,
} from "@/services/exerciseCollectionService.js";
import {
  EXERCISES,
  getExerciseType,
} from "@/services/exercises.js";
import { useProfileStore } from '@/stores/useProfileStore.js';
import { getGradientColors } from "@/services/chartColors.js";

const store = useProfileStore();
const { tests, profile } = storeToRefs(store);

const CHART_METRICS = computed(() => [
  ...EXERCISES,
  { key: 'score', label: t('dashboard.chart.scoreLabel') },
]);

const crosshairPlugin = {
  id: 'crosshair',
  afterDraw: (chart) => {
    if (chart.tooltip?._active?.length) {
      const ctx = chart.ctx;
      const activePoint = chart.tooltip._active[0];
      const x = activePoint.element.x;
      const topY = chart.scales.y.top;
      const bottomY = chart.scales.y.bottom;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x, topY);
      ctx.lineTo(x, bottomY);
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(107, 114, 128, 0.4)';
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.restore();
    }
  }
};

// Plugin to draw year divider lines
const yearDividerPlugin = {
  id: 'yearDivider',
  afterDraw: (chart) => {
    const yearBoundaries = chart.options.plugins?.yearDivider?.boundaries;
    if (!yearBoundaries?.length) return;

    const ctx = chart.ctx;
    const xScale = chart.scales.x;
    const yScale = chart.scales.y;

    yearBoundaries.forEach(({ index, year }) => {
      // Get x position between current and previous point
      const x = xScale.getPixelForValue(index) - (xScale.getPixelForValue(1) - xScale.getPixelForValue(0)) / 2;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x, yScale.top);
      ctx.lineTo(x, yScale.bottom);
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.35)';
      ctx.setLineDash([3, 3]);
      ctx.stroke();

      // Draw year label
      ctx.fillStyle = 'rgba(124, 58, 237, 0.5)';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(year, x + 4, yScale.bottom - 6);

      ctx.restore();
    });
  }
};

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
  crosshairPlugin,
  yearDividerPlugin,
);

const { t } = useI18n();

const selectedMetric = ref(EXERCISES[0].key);

const selectedData = computed(() => {
  if (selectedMetric.value === 'score') {
    return filterTestsByTotalScore(tests.value, profile.value) || [];
  }
  return filterTestsByMetric(tests.value, selectedMetric.value) || [];
});

const stats = computed(() => calculateStats(selectedData.value));

// Calculate year boundaries for divider lines
const yearBoundaries = computed(() => {
  const data = selectedData.value;
  if (!data || data.length < 2) return [];

  const boundaries = [];
  for (let i = 1; i < data.length; i++) {
    const prevYear = data[i - 1].date?.split('-')[0];
    const currYear = data[i].date?.split('-')[0];
    if (prevYear && currYear && prevYear !== currYear) {
      boundaries.push({ index: i, year: currYear });
    }
  }
  return boundaries;
});

function formatDateLabel(dateStr) {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length < 3) return dateStr;
  const [year, month, day] = parts;
  const date = new Date(year, parseInt(month, 10) - 1, day || 1);
  return date.toLocaleDateString(undefined, { month: 'short' });
}

function calculateMovingAverage(values, windowSize = 3) {
  if (!values || values.length < 2) return [];
  return values.map((_, index) => {
    const start = Math.max(0, index - Math.floor(windowSize / 2));
    const end = Math.min(values.length, index + Math.ceil(windowSize / 2));
    const window = values.slice(start, end);
    const sum = window.reduce((a, b) => a + b, 0);
    return sum / window.length;
  });
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

  const values = data.map((d) => d.value);
  const movingAvg = calculateMovingAverage(values, 3);

  return {
    labels: data.map((d) => formatDateLabel(d.date)),
    datasets: [
      {
        label: selectedMetric.value === 'score'
          ? t('dashboard.chart.scoreLabel')
          : (getExerciseType(selectedMetric.value)?.label || ""),
        data: values,
        borderColor: baseColor,
        backgroundColor: gradientFill,
        fill: true,
        tension: 0.3,
        pointRadius: 8,
        pointHoverRadius: 9,
        pointBackgroundColor: pointColor,
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        datalabels: {
          anchor: "end",
          align: "end",
          color: baseColor,
          font: { weight: "bold", size: 12 },
          formatter: (value) => {
            if (value == null) return "";
            return Number.isInteger(value) ? value : value.toFixed(1);
          },
          display: true,
          clip: false,
        },
      },
      {
        label: `${t("dashboard.chart.movingAverage") || "3-point trend"}`,
        data: movingAvg,
        borderColor: 'rgba(156, 163, 175, 0.6)',
        backgroundColor: 'transparent',
        fill: false,
        tension: 0.4,
        borderDash: [5, 5],
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 0,
        pointBackgroundColor: 'transparent',
        datalabels: {
          anchor: "end",
          align: "end",
          color: 'rgba(107, 114, 128, 0.6)',
          font: { weight: "normal", size: 10 },
          formatter: (value) => (value != null ? value.toFixed(1) : ""),
          display: true,
          clip: false,
          offset: 8,
        },
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
        top: 45, // Increased padding for label visibility
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
            // Handle total score metric (no reps/version)
            if (selectedMetric.value === 'score') {
              return `${t('dashboard.chart.scoreLabel')}: ${context.parsed.y} pts`;
            }
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
        display: false,
      },
      yearDivider: {
        boundaries: yearBoundaries.value,
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
    <div class="mb-4">
      <h2 class="mb-3">{{ t("dashboard.chart.title") }}</h2>
      <div class="flex flex-wrap gap-2">
        <button v-for="m in CHART_METRICS" :key="m.key" @click="selectedMetric = m.key"
          :aria-pressed="selectedMetric === m.key" :class="[
            'px-3 py-1.5 text-sm font-medium rounded-full transition-all',
            selectedMetric === m.key
              ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-300'
              : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
          ]">
          {{ m.label }}
        </button>
      </div>
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
