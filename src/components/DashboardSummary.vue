<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import AppCard from '@/components/ui/AppCard.vue'
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  summary: { type: Object, default: () => null },
})

const { t } = useI18n()

const nf = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 })

const hasTests = computed(() => props.summary && props.summary.testCount > 0)

const improvement = computed(() => props.summary?.improvement ?? null)

const best = computed(() => props.summary?.best ?? null)

const cooperLevel = computed(() => props.summary?.cooperLevel ?? null)

const cooperLabel = computed(() => {
  const keys = {
    1: 'cooper.very_bad',
    2: 'cooper.bad',
    3: 'cooper.normal',
    4: 'cooper.good',
    5: 'cooper.very_good',
  }
  return cooperLevel.value && keys[cooperLevel.value] ? t(keys[cooperLevel.value]) : null
})

const improvementTileClass = computed(() => {
  if (improvement.value == null) return 'border-gray-300'
  if (improvement.value > 0) return 'border-green-400 bg-green-50'
  if (improvement.value < 0) return 'border-red-400 bg-red-50'
  return 'border-gray-300'
})

const improvementValueClass = computed(() => {
  if (improvement.value == null) return ''
  if (improvement.value > 0) return 'text-green-700'
  if (improvement.value < 0) return 'text-red-600'
  return 'text-gray-700'
})

const improvementSign = computed(() => {
  if (improvement.value == null) return null
  if (improvement.value > 0) return ArrowUpIcon
  if (improvement.value < 0) return ArrowDownIcon
  return MinusIcon
})

const cooperTileClass = computed(() => {
  if (cooperLevel.value <= 2) return 'border-red-300 bg-red-50'
  if (cooperLevel.value === 3) return 'border-gray-300'
  return 'border-green-400 bg-green-50'
})

const cooperValueClass = computed(() => {
  if (cooperLevel.value <= 2) return 'text-red-600'
  if (cooperLevel.value === 3) return 'text-gray-700'
  return 'text-green-700'
})
</script>

<template>
  <AppCard data-testid="dashboard-summary">
    <div class="mb-3 flex flex-wrap items-baseline justify-between gap-2">
      <h2>{{ t('dashboard.summary.title') }}</h2>
      <p v-if="hasTests" class="text-sm text-gray-500">
        {{ summary.testCount }} {{ t('dashboard.summary.tests')
        }}<template v-if="summary.firstYear">
          · {{ t('dashboard.summary.since') }} {{ summary.firstYear }}</template
        >
      </p>
    </div>

    <div v-if="!hasTests" class="py-6 text-center text-sm text-gray-500">
      {{ t('dashboard.summary.addFirst') }}
    </div>

    <div v-else class="flex flex-wrap items-stretch gap-2">
      <div
        class="flex min-w-[130px] flex-1 flex-col rounded-lg border px-3 py-2.5 text-center"
        :class="improvementTileClass"
      >
        <div class="text-xs uppercase tracking-wide text-gray-500">
          {{ t('dashboard.summary.improvement') }}
        </div>
        <div v-if="improvement === null" class="mt-1 text-sm font-medium text-gray-400">
          {{ t('dashboard.summary.needOneMore') }}
        </div>
        <template v-else>
          <div class="text-2xl font-bold tabular-nums sm:text-3xl" :class="improvementValueClass">
            <component :is="improvementSign" class="mr-0.5 inline size-5 align-baseline" />
            {{ (improvement > 0 ? '+' : '') + nf.format(improvement) }}
          </div>
          <div class="mt-0.5 text-[10px] uppercase tracking-wider text-gray-400">
            {{ t('dashboard.summary.points') }}
          </div>
        </template>
      </div>

      <div
        v-if="best !== null"
        class="flex min-w-[130px] flex-1 flex-col rounded-lg border border-gray-300 px-3 py-2.5 text-center"
      >
        <div class="text-xs uppercase tracking-wide text-gray-500">
          {{ t('dashboard.summary.best') }}
        </div>
        <div class="text-2xl font-bold tabular-nums text-gray-800 sm:text-3xl">
          {{ nf.format(best) }}
        </div>
        <div class="mt-0.5 text-[10px] uppercase tracking-wider text-gray-400">
          {{ t('dashboard.summary.points') }}
        </div>
      </div>

      <div
        v-if="cooperLabel"
        class="flex min-w-[130px] flex-1 flex-col rounded-lg border px-3 py-2.5 text-center"
        :class="cooperTileClass"
      >
        <div class="text-xs uppercase tracking-wide text-gray-500">
          {{ t('dashboard.summary.fitnessLevel') }}
        </div>
        <div class="text-2xl font-bold sm:text-3xl" :class="cooperValueClass">
          {{ cooperLabel }}
        </div>
      </div>
    </div>
  </AppCard>
</template>
