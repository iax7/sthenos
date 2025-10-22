<script setup>
import { computed } from 'vue'

const props = defineProps({
  stats: { type: Object, default: null }
})

// Format numbers with grouping; allow integers without decimals
const nf = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 })

const items = computed(() => {
  if (!props.stats) return []
  return [
    { key: 'first', label: 'First', value: props.stats.first },
    { key: 'last', label: 'Last', value: props.stats.last },
    { key: 'min', label: 'Min', value: props.stats.min },
    { key: 'max', label: 'Max', value: props.stats.max },
    { key: 'delta', label: 'Δ', value: props.stats.delta },
    { key: 'pct', label: '%', value: props.stats.pct }, // keep raw numeric or null
  ]
})

function isNegative(val) {
  return typeof val === 'number' && val < 0
}
</script>

<template>
  <div v-if="items.length" class="flex flex-wrap items-stretch gap-2 mt-2">
    <div
      v-for="it in items"
      :key="it.key"
      class="border border-gray-300 rounded-md px-3 py-2 w-20 text-center transition-colors"
      :class="isNegative(it.value) ? 'bg-red-50 border-red-300 text-red-700 hover:text-red-800' : 'hover:bg-gray-50'"
    >
      <div class="text-xs uppercase tracking-wide font-medium"
           :class="isNegative(it.value) ? 'text-red-700/80' : 'text-gray-500'">
        {{ it.label }}
      </div>
      <div class="text-lg font-bold sm:text-2xl tabular-nums"
           :class="isNegative(it.value) ? 'text-red-700' : ''">
        <template v-if="it.key === 'pct'">
          <span v-if="it.value == null">n/a</span>
          <span v-else>{{ it.value.toFixed(1) }}</span>
        </template>
        <template v-else>
          <span v-if="typeof it.value === 'number'">{{ (it.value > 0 ? '' : '') + nf.format(it.value) }}</span>
          <span v-else>{{ it.value }}</span>
        </template>
      </div>
    </div>
  </div>
</template>
