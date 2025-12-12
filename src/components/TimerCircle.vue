<template>
  <div class="relative inline-flex items-center justify-center">
    <!-- SVG Circle -->
    <svg
      :width="size"
      :height="size"
      class="transform -rotate-90"
    >
      <!-- Background circle -->
      <circle
        :r="radius"
        :cx="center"
        :cy="center"
        fill="transparent"
        :stroke="backgroundColor"
        :stroke-width="strokeWidth"
      />

      <!-- Progress circle -->
      <circle
        :r="radius"
        :cx="center"
        :cy="center"
        fill="transparent"
        :stroke="progressColor"
        :stroke-width="strokeWidth"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
        stroke-linecap="round"
        class="transition-all duration-1000 ease-linear"
      />
    </svg>

    <!-- Centered content -->
    <div class="absolute inset-0 flex flex-col items-center justify-center">
      <div class="text-7xl font-bold tabular-nums" :style="{ color: progressColor }">
        {{ formattedTime }}
      </div>
      <div class="text-3xl text-gray-600 mt-3 font-medium">
        {{ label }}
      </div>
      <div v-if="subtitle" class="text-sm text-gray-400 mt-1">
        {{ subtitle }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentTime: { type: Number, required: true },
  totalTime: { type: Number, required: true },
  label: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  size: { type: Number, default: 300 },
  strokeWidth: { type: Number, default: 12 },
  backgroundColor: { type: String, default: '#e5e7eb' },
  progressColor: { type: String, default: '#10b981' }
})

const center = computed(() => props.size / 2)
const radius = computed(() => (props.size - props.strokeWidth) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)

const progress = computed(() => {
  if (!props.totalTime) return 0
  return props.currentTime / props.totalTime
})

const dashOffset = computed(() =>
  circumference.value * (1 - progress.value)
)

const formattedTime = computed(() => {
  const mins = Math.floor(props.currentTime / 60)
  const secs = props.currentTime % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
})
</script>

