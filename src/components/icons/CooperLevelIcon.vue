<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  level: { type: Number, default: null }, // 1-5 from evaluateCooper
  size: { type: Number, default: 20 },
  showText: { type: Boolean, default: false }
})

// Map Cooper result numeric level (1-5) to metadata (label, color, short code)
const { t } = useI18n()

const cooperLevelMeta = (level) => {
  switch (level) {
    case 1:
      return { level, labelKey: 'cooper.very_low', color: '#dc2626', short: 'VB' };
    case 2:
      return { level, labelKey: 'cooper.low', color: '#f97316', short: 'B' };
    case 3:
      return { level, labelKey: 'cooper.normal', color: '#facc15', short: 'N' };
    case 4:
      return { level, labelKey: 'cooper.good', color: '#22c55e', short: 'G' };
    case 5:
      return { level, labelKey: 'cooper.very_good', color: '#0ea5e9', short: 'VG' };
    default:
      return { level: null, labelKey: 'cooper.na', color: '#6b7280', short: '-' };
  }
}

const meta = computed(() => cooperLevelMeta(props.level))
const radius = computed(() => props.size / 2)
</script>

<template>
  <div class="relative inline-flex items-center group">
    <svg :width="props.size" :height="props.size" :viewBox="`0 0 ${props.size} ${props.size}`" class="cursor-help">
      <circle :cx="radius" :cy="radius" :r="radius - 1" :fill="meta.color" stroke="white" stroke-width="1" />
      <text v-if="props.showText" :x="radius" :y="radius + 0.5" text-anchor="middle" font-size="8" fill="white" font-weight="600">
        {{ meta.short }}
      </text>
    </svg>
    <div class="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 font-medium text-gray-100 opacity-0 group-hover:opacity-100 transition">
      {{ t(meta.labelKey) }}
    </div>
  </div>
</template>

<style scoped>
svg { font-family: system-ui, sans-serif; }
</style>
