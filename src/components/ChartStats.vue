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
    { key: 'first', label: 'First', value: props.stats.first, canChange: false },
    { key: 'last', label: 'Last', value: props.stats.last, canChange: false },
    { key: 'min', label: 'Min', value: props.stats.min, canChange: false },
    { key: 'max', label: 'Max', value: props.stats.max, canChange: false },
    { key: 'delta', label: 'Δ', value: props.stats.delta, canChange: true },
    { key: 'pct', label: '%', value: props.stats.pct, canChange: true },
  ]
})

function getColorClass(item) {
  if (!item.canChange || typeof item.value !== 'number') return ''
  if (item.value > 0) return 'positive'
  if (item.value < 0) return 'negative'
  return ''
}
</script>

<template>
  <div v-if="items.length" class="flex flex-wrap items-stretch gap-2 mt-2">
    <div
      v-for="it in items"
      :key="it.key"
      class="border rounded-md px-3 py-2 w-22 text-center transition-colors text-gray-600"
      :class="{
        'border-gray-300 hover:bg-gray-50': getColorClass(it) === '',
        'bg-green-50 border-green-300 text-green-700 hover:bg-green-100': getColorClass(it) === 'positive',
        'bg-red-50 border-red-300 text-red-700 hover:bg-red-100': getColorClass(it) === 'negative'
      }"
    >
      <div
        class="text-xs uppercase tracking-wide font-medium"
        :class="{
          'text-gray-400': getColorClass(it) === '',
          'text-green-700/80': getColorClass(it) === 'positive',
          'text-red-700/80': getColorClass(it) === 'negative'
        }"
      >
        {{ it.label }}
      </div>
      <div
        class="text-lg font-bold sm:text-2xl tabular-nums"
        :class="{
          'text-green-700': getColorClass(it) === 'positive',
          'text-red-700': getColorClass(it) === 'negative'
        }"
      >
        <template v-if="it.key === 'pct'">
          <span v-if="it.value == null">n/a</span>
          <span v-else>{{ (it.value > 0 ? '+' : '') + it.value.toFixed(1) }}</span>
        </template>
        <template v-else-if="it.key === 'delta'">
          <span v-if="typeof it.value === 'number'">{{ (it.value > 0 ? '+' : '') + nf.format(it.value) }}</span>
          <span v-else>{{ it.value }}</span>
        </template>
        <template v-else>
          <span v-if="typeof it.value === 'number'">{{ nf.format(it.value) }}</span>
          <span v-else>{{ it.value }}</span>
        </template>
      </div>
    </div>
  </div>
</template>
