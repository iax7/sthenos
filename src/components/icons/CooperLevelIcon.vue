<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  level: { type: Number, default: null }, // 1-5 from evaluateCooper
  size: { type: Number, default: 20 },
  showText: { type: Boolean, default: false }
})

const { t } = useI18n()

const cooperLevels = {
  1: { color: '#dc2626', textColor: '#fff', labelKey: 'cooper.very_bad', shortKey: 'cooper.vb' },
  2: { color: '#f97316', textColor: '#fff', labelKey: 'cooper.bad', shortKey: 'cooper.b' },
  3: { color: '#facc15', textColor: '#000', labelKey: 'cooper.normal', shortKey: 'cooper.n' },
  4: { color: '#22c55e', textColor: '#fff', labelKey: 'cooper.good',  shortKey: 'cooper.g' },
  5: { color: '#0ea5e9', textColor: '#fff', labelKey: 'cooper.very_good', shortKey: 'cooper.vg' },
}

const meta = computed(() => {
  return cooperLevels[props.level] || { color: '#6b7280', labelKey: 'cooper.na', shortKey: 'cooper.na' };
});
const radius = computed(() => props.size / 2)
</script>

<template>
  <div class="relative inline-flex items-center group">
    <svg :width="props.size" :height="props.size" :viewBox="`0 0 ${props.size} ${props.size}`" class="cursor-help">
      <circle :cx="radius" :cy="radius" :r="radius - 1" :fill="meta.color" stroke="white" stroke-width="1" />
      <text v-if="props.showText" :x="radius" :y="radius + 3" text-anchor="middle" font-size="9" :fill="meta.textColor" font-weight="900">
        {{ t(meta.shortKey) }}
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
