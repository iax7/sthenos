<script setup>
import { computed, ref, nextTick, watch } from "vue";
import Card from "./ui/Card.vue";
import ChartStats from "./ChartStats.vue";

const props = defineProps({
  tests: { type: Array, default: () => [] },
});

const METRICS = [
  { key: "pullup", label: "Pull Ups", get: (t) => t.pullup?.reps ?? null },
  { key: "pushup", label: "Push Ups", get: (t) => t.pushup?.reps ?? null },
  { key: "squats", label: "Squats", get: (t) => t.squats?.reps ?? null },
  { key: "vups", label: "V-Ups", get: (t) => t.vups?.reps ?? null },
  { key: "burpees", label: "Burpees", get: (t) => t.burpees?.reps ?? null },
  { key: "cooper", label: "Cooper Laps", get: (t) => t.cooper ?? null },
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

const viewBox = "0 0 600 240";
const padding = { left: 40, right: 16, top: 20, bottom: 30 };

// Animated path data
const pathData = computed(() => {
  const data = filtered.value;
  if (data.length < 2) return "";
  const xs = data.map((_, i) => i);
  const maxX = xs[xs.length - 1] || 1;
  const values = data.map((d) => d.value);
  const minY = Math.min(...values);
  const maxY = Math.max(...values);
  const scaleX = (x) =>
    padding.left + (x / maxX) * (600 - padding.left - padding.right);
  const scaleY = (y) =>
    padding.top +
    (1 - (y - minY) / (maxY - minY || 1)) *
      (240 - padding.top - padding.bottom);
  let d = "";
  data.forEach((pt, i) => {
    const x = scaleX(xs[i]);
    const y = scaleY(pt.value);
    d += (i === 0 ? "M" : "L") + x + " " + y + " ";
  });
  return d.trim();
});

const areaData = computed(() => {
  const data = filtered.value;
  if (data.length < 2) return "";
  const xs = data.map((_, i) => i);
  const maxX = xs[xs.length - 1] || 1;
  const values = data.map((d) => d.value);
  const minY = Math.min(...values);
  const maxY = Math.max(...values);
  const scaleX = (x) =>
    padding.left + (x / maxX) * (600 - padding.left - padding.right);
  const scaleY = (y) =>
    padding.top +
    (1 - (y - minY) / (maxY - minY || 1)) *
      (240 - padding.top - padding.bottom);
  let d = "";
  data.forEach((pt, i) => {
    const x = scaleX(xs[i]);
    const y = scaleY(pt.value);
    d += (i === 0 ? "M" : "L") + x + " " + y + " ";
  });
  const baselineY = scaleY(minY);
  d += "L " + scaleX(xs[xs.length - 1]) + " " + baselineY + " ";
  d += "L " + scaleX(xs[0]) + " " + baselineY + " Z";
  return d.trim();
});

const markers = computed(() => {
  const data = filtered.value;
  if (data.length === 0) return [];
  const xs = data.map((_, i) => i);
  const maxX = xs[xs.length - 1] || 1;
  const values = data.map((d) => d.value);
  const minY = Math.min(...values);
  const maxY = Math.max(...values);
  const scaleX = (x) =>
    padding.left + (x / maxX) * (600 - padding.left - padding.right);
  const scaleY = (y) =>
    padding.top +
    (1 - (y - minY) / (maxY - minY || 1)) *
      (240 - padding.top - padding.bottom);
  return data.map((pt, i) => ({
    x: scaleX(xs[i]),
    y: scaleY(pt.value),
    date: pt.date,
    value: pt.value,
    version: pt.version
  }));
});

function formatDateLabel(dateStr) {
  if (!dateStr) return ''
  const parts = dateStr.split('-')
  if (parts.length < 2) return dateStr
  const [y, m] = parts
  return y.slice(-2) + '-' + m
}

const xTicks = computed(() => {
  const data = filtered.value
  if (data.length === 0) return []
  // Recompute scales (same logic as above) to position ticks
  const xs = data.map((_, i) => i)
  const maxX = xs[xs.length - 1] || 1
  const values = data.map(d => d.value)
  const minY = Math.min(...values)
  const maxY = Math.max(...values)
  const scaleX = (x) => padding.left + (x / maxX) * (600 - padding.left - padding.right)
  // Determine step to avoid overlap (aim <= 8 labels)
  const maxTicks = 8
  const step = Math.max(1, Math.ceil(data.length / maxTicks))
  return data.filter((_, i) => i % step === 0).map((d, i) => ({
    x: scaleX(xs[i * step] ?? i * step),
    label: formatDateLabel(d.date)
  }))
})

const hover = ref(null);
function setHover(m) {
  hover.value = m;
}
function clearHover() {
  hover.value = null;
}

// Refs to SVG elements for animation
const pathRef = ref(null);
const areaRef = ref(null);

function animatePath() {
  const el = pathRef.value;
  if (!el) return;
  const length = el.getTotalLength?.() || 0;
  el.style.strokeDasharray = length;
  el.style.strokeDashoffset = length;
  // force reflow
  void el.getBoundingClientRect();
  el.style.transition = "stroke-dashoffset 0.9s ease";
  el.style.strokeDashoffset = "0";
}

function animateArea() {
  const el = areaRef.value;
  if (!el) return;
  el.style.opacity = "0";
  el.style.transition = "opacity 0.6s ease";
  // force reflow
  void el.getBoundingClientRect();
  el.style.opacity = "1";
}

// Trigger animations whenever data or metric changes
watch([pathData, areaData], async () => {
  await nextTick();
  animatePath();
  animateArea();
});
</script>

<template>
  <Card>
    <div class="mb-4 flex items-center justify-between">
      <h2>Performance Trend</h2>
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
      Not enough data points for a trend (need at least 2).
    </div>
    <div v-else>
      <svg :viewBox="viewBox" class="h-60 w-full select-none">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.35" />
            <stop offset="100%" stop-color="#3b82f6" stop-opacity="0" />
          </linearGradient>
        </defs>
        <line
          :x1="padding.left"
          :y1="padding.top"
          :x2="padding.left"
          :y2="240 - padding.bottom"
          stroke="#d1d5db"
          stroke-width="1"
        />
        <line
          :x1="padding.left"
          :y1="240 - padding.bottom"
          :x2="600 - padding.right"
          :y2="240 - padding.bottom"
          stroke="#d1d5db"
          stroke-width="1"
        />
        <!-- X axis ticks & labels -->
        <g>
          <g v-for="t in xTicks" :key="t.x + t.label">
            <line :x1="t.x" :x2="t.x" :y1="240 - padding.bottom" :y2="240 - padding.bottom + 4" stroke="#9ca3af" stroke-width="1" />
            <text :x="t.x" :y="240 - padding.bottom + 16" text-anchor="middle" font-size="10" fill="#4b5563">{{ t.label }}</text>
          </g>
        </g>
        <path ref="areaRef" :d="areaData" fill="url(#areaGrad)" />
        <path
          ref="pathRef"
          :d="pathData"
          stroke="#2563eb"
          stroke-width="2"
          fill="none"
          stroke-linejoin="round"
          stroke-linecap="round"
        />
        <g>
          <g
            v-for="m in markers"
            :key="m.date + m.x"
            @mouseenter="setHover(m)"
            @mouseleave="clearHover"
            class="cursor-pointer"
          >
            <circle :cx="m.x" :cy="m.y" r="4" fill="#1d4ed8" />
            <text
              :x="m.x"
              :y="m.y - 8"
              text-anchor="middle"
              font-size="11"
              fill="#1d4ed8"
              font-weight="600"
            >
              {{ m.value }}<tspan v-if="m.version" font-size="9" fill="#1e3a8a"> ({{ m.version }})</tspan>
            </text>
          </g>
        </g>
      </svg>
      <ChartStats :stats="stats" />
    </div>
  </Card>
</template>

<style scoped>
/* Optional smoother appearance on mount */
svg path[ref="pathRef"] {
  will-change: stroke-dashoffset;
}
svg path[ref="areaRef"] {
  will-change: opacity;
}
</style>
