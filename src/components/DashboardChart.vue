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
  Filler
} from "chart.js";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import Card from "./ui/Card.vue";
import ChartStats from "./ChartStats.vue";
import {
  PULL_UP_VERSIONS,
  PUSH_UP_VERSIONS,
  SQUAT_VERSIONS,
  VUP_VERSIONS,
  BURPEE_VERSIONS
} from '../services/exerciseVersions.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartDataLabels
);

const props = defineProps({
  tests: { type: Array, default: () => [] },
});

const { t } = useI18n();

const METRICS = [
  { key: "pullup", label: "Pull Ups", get: (t) => t.pullup?.reps ?? null, versions: PULL_UP_VERSIONS },
  { key: "pushup", label: "Push Ups", get: (t) => t.pushup?.reps ?? null, versions: PUSH_UP_VERSIONS },
  { key: "squats", label: "Squats", get: (t) => t.squats?.reps ?? null, versions: SQUAT_VERSIONS },
  { key: "vups", label: "V-Ups", get: (t) => t.vups?.reps ?? null, versions: VUP_VERSIONS },
  { key: "burpees", label: "Burpees", get: (t) => t.burpees?.reps ?? null, versions: BURPEE_VERSIONS },
  { key: "cooper", label: "Cooper Laps", get: (t) => t.cooper ?? null, versions: [] },
];

const selectedMetric = ref(METRICS[0].key);

const filtered = computed(() => {
  const metric = METRICS.find((m) => m.key === selectedMetric.value);
  if (!metric) return [];
  return props.tests
    .slice()
    .filter((t) => t.date && metric.get(t) != null)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((t) => {
      const rawMetric = t[metric.key];
      const version = rawMetric && typeof rawMetric === 'object' ? (rawMetric.version || '') : '';
      return { date: t.date, value: Number(metric.get(t)), version };
    });
});

const stats = computed(() => {
  if (filtered.value.length === 0) return null;
  const values = filtered.value.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const first = values[0];
  const last = values[values.length - 1];
  const delta = last - first;
  const pct = first === 0 ? null : (delta / first) * 100;
  return { min, max, first, last, delta, pct };
});

function formatDateLabel(dateStr) {
  if (!dateStr) return ''
  const parts = dateStr.split('-')
  if (parts.length < 2) return dateStr
  const [y, m] = parts
  return y.slice(-2) + '-' + m
}

const chartData = computed(() => {
  const data = filtered.value;
  // backgroundColor as function for gradient
  const gradientFill = (ctx) => {
    const chart = ctx.chart;
    const {ctx: canvasCtx, chartArea} = chart;
    if (!chartArea) return 'rgba(37,99,235,0.1)';
    const grad = canvasCtx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
    grad.addColorStop(0, 'rgba(37,99,235,0.6)');
    grad.addColorStop(1, 'rgba(37,99,235,0.25)');
    return grad;
  };
  return {
    labels: data.map(d => formatDateLabel(d.date)),
    datasets: [
      {
        label: METRICS.find(m => m.key === selectedMetric.value)?.label || '',
        data: data.map(d => d.value),
        borderColor: '#2563eb',
        backgroundColor: gradientFill,
        fill: true,
        tension: 0.3,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: '#1d4ed8',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      }
    ]
  };
});

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const dataPoint = filtered.value[context.dataIndex];
          const metric = METRICS.find(m => m.key === selectedMetric.value);
          let versionLabel = '';
          if (dataPoint?.version && metric?.versions) {
            const versionObj = metric.versions.find(v => v.value === dataPoint.version);
            versionLabel = versionObj ? ` (${t(versionObj.labelKey)})` : ` (${dataPoint.version})`;
          }
          return `${context.parsed.y}${versionLabel}`;
        }
      }
    },
    datalabels: {
      anchor: 'end',
      align: 'end',
      color: '#1d4ed8',
      font: {
        weight: 'bold',
        size: 12
      },
      formatter: (value, context) => {
        // Show only if value is not null/undefined
        return value != null ? value : '';
      },
      display: true
    }
  },
  scales: {
    y: {
      beginAtZero: false,
      grid: {
        color: 'rgba(209, 213, 219, 0.3)'
      },
      ticks: {
        callback: function(value) {
          return Number.isInteger(value) ? value : '';
        },
        stepSize: 1
      }
    },
    x: {
      grid: {
        display: false
      }
    }
  }
}));
</script>

<template>
  <Card>
    <div class="mb-4 flex items-center justify-between">
      <h2>{{ t('dashboard.chart.title') }}</h2>
      <select
        v-model="selectedMetric"
        class="form-input"
      >
        <option v-for="m in METRICS" :key="m.key" :value="m.key">
          {{ m.label }}
        </option>
      </select>
    </div>
    <div v-if="filtered.length < 2" class="text-sm text-gray-500">
      {{ t('dashboard.chart.notEnoughData') }}
    </div>
    <div v-else>
      <div class="h-60 w-full">
        <Line :data="chartData" :options="chartOptions" />
      </div>
      <ChartStats :stats="stats" />
    </div>
  </Card>
</template>

<style scoped>
/* Optional: Add any custom styles if needed */
</style>
