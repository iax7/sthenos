<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from '@heroicons/vue/24/outline'
import { getColorClass as getColorClassFromPct } from '@/services/chartColors.js'

const { t } = useI18n()

const props = defineProps({
  stats: { type: Object, default: null }
})

// Format numbers with grouping; allow integers without decimals
const nf = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 })

const items = computed(() => {
  if (!props.stats) return []
  return [
    {
      key: 'size',
      label: t('dashboard.stats.size'),
      value: props.stats.size,
      canChange: false,
      tooltip: t('dashboard.stats.sizeTooltip'),
      group: 'info'
    },
    {
      key: 'first',
      label: t('dashboard.stats.first'),
      value: props.stats.first,
      canChange: false,
      tooltip: t('dashboard.stats.firstTooltip'),
      group: 'range'
    },
    {
      key: 'last',
      label: t('dashboard.stats.last'),
      value: props.stats.last,
      canChange: false,
      tooltip: t('dashboard.stats.lastTooltip'),
      group: 'range'
    },
    {
      key: 'min',
      label: t('dashboard.stats.min'),
      value: props.stats.min,
      canChange: false,
      tooltip: t('dashboard.stats.minTooltip'),
      group: 'minmax'
    },
    {
      key: 'max',
      label: t('dashboard.stats.max'),
      value: props.stats.max,
      canChange: false,
      tooltip: t('dashboard.stats.maxTooltip'),
      group: 'minmax'
    },
    {
      key: 'delta',
      label: 'Δ',
      value: props.stats.delta,
      canChange: true,
      tooltip: t('dashboard.stats.deltaTooltip'),
      group: 'trend',
      featured: true
    },
    {
      key: 'pct',
      label: '%',
      value: props.stats.pct,
      canChange: true,
      tooltip: t('dashboard.stats.pctTooltip'),
      group: 'trend',
      featured: true
    },
  ]
})

function getColorClass(item) {
  if (!item.canChange) return ''
  return getColorClassFromPct(props.stats?.pct, item.value)
}

function getTrendIcon(item) {
  if (!item.canChange || typeof item.value !== 'number') return null
  if (item.value > 0) return ArrowUpIcon
  if (item.value < 0) return ArrowDownIcon
  if (item.value === 0) return MinusIcon
  return null
}
</script>

<template>
  <div v-if="items.length" class="flex flex-wrap items-stretch gap-2 mt-4">
    <div v-for="it in items" :key="it.key" :title="it.tooltip"
      class="border rounded-lg px-3 py-2.5 text-center transition-all duration-200 cursor-help group relative" :class="{
        'flex-1 min-w-[90px] sm:min-w-[100px]': !it.featured,
        'flex-1 min-w-[110px] sm:min-w-[130px]': it.featured,
        'border-gray-300 hover:border-gray-400 hover:shadow-md': getColorClass(it) === '',
        'bg-green-50 border-green-400 text-green-700 hover:bg-green-100 hover:shadow-lg': getColorClass(it) === 'green',
        'bg-blue-50 border-blue-400 text-blue-700 hover:bg-blue-100 hover:shadow-lg': getColorClass(it) === 'positive',
        'bg-red-50 border-red-400 text-red-700 hover:bg-red-100 hover:shadow-lg': getColorClass(it) === 'negative',
        'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100 hover:shadow-md': getColorClass(it) === 'neutral'
      }">
      <!-- Tooltip on hover -->
      <div
        class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 pointer-events-none z-10 max-w-[200px] text-center sm:whitespace-nowrap sm:max-w-none">
        {{ it.tooltip }}
        <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900">
        </div>
      </div>

      <div class="text-xs uppercase tracking-wide font-semibold mb-1 flex items-center justify-center gap-1" :class="{
        'text-gray-500': getColorClass(it) === '',
        'text-green-700': getColorClass(it) === 'green',
        'text-blue-700': getColorClass(it) === 'positive',
        'text-red-700': getColorClass(it) === 'negative',
        'text-blue-700': getColorClass(it) === 'neutral'
      }">
        <component v-if="getTrendIcon(it)" :is="getTrendIcon(it)" class="size-3.5 sm:size-4" />
        <span>{{ it.label }}</span>
      </div>

      <div class="font-bold tabular-nums transition-all duration-300" :class="{
        'text-xl sm:text-2xl': !it.featured,
        'text-2xl sm:text-3xl': it.featured,
        'text-green-700': getColorClass(it) === 'green',
        'text-blue-700': getColorClass(it) === 'positive',
        'text-red-700': getColorClass(it) === 'negative',
        'text-blue-700': getColorClass(it) === 'neutral',
        'text-gray-700': getColorClass(it) === ''
      }">
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

      <div v-if="typeof it.value === 'number'" class="text-[10px] uppercase tracking-wider mt-0.5" :class="{
        'text-gray-400': getColorClass(it) === '',
        'text-green-600/70': getColorClass(it) === 'green',
        'text-blue-600/70': getColorClass(it) === 'positive',
        'text-red-600/70': getColorClass(it) === 'negative',
        'text-blue-600/70': getColorClass(it) === 'neutral'
      }">
      </div>
    </div>
  </div>
</template>
