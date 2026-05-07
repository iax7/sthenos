<script setup>
import { computed } from 'vue'
import { useProfileStore } from '@/composables/useProfileStore.js'
import { useI18n } from 'vue-i18n'
import HomeChart from '@/components/HomeChart.vue'
import HomeHeader from '@/components/HomeHeader.vue'
import ViewContainer from '@/components/ui/ViewContainer.vue'
import { calculateTotalScore } from '@/services/exercises.js'
import { toMeters, evaluateCooper } from '@/services/cooper.js'
import { ChevronRightIcon } from '@heroicons/vue/24/outline'

const { profile, tests } = useProfileStore()
const { t, locale } = useI18n()

const lastTest = computed(() => {
  if (!tests.value?.length) return null
  const test = tests.value[tests.value.length - 1]
  const age = profile.value?.age || 0
  const genderKey = profile.value?.gender?.toLowerCase() || 'm'
  const meters = toMeters(test.cooper || 0)
  const level = evaluateCooper(meters, age, genderKey)
  const score = calculateTotalScore(test, level)

  const [y, m, d] = (test.date || '').split('-')
  const date = new Date(y, parseInt(m, 10) - 1, d || 1)
  const label = date.toLocaleDateString(locale.value, { month: 'long', year: 'numeric' })

  return { label, score }
})
</script>

<template>
  <ViewContainer>
    <HomeHeader :profile="profile" />
    <router-link to="/tests"
      class="mt-4 flex flex-col rounded-lg border border-gray-200 bg-white px-4 py-4 shadow-sm hover:bg-gray-50">
      <div class="flex items-center justify-between">
        <span class="text-lg font-semibold text-gray-800">{{ t('dashboard.table.title') }}</span>
        <span class="text-sm text-gray-400 flex items-center gap-1">{{ tests.length }} {{ t('nav.entries') }} <ChevronRightIcon class="size-4" /></span>
      </div>
      <div v-if="lastTest" class="mt-3 flex items-end justify-between border-t border-gray-100 pt-3">
        <div class="flex flex-col">
          <span class="text-xs uppercase tracking-wide text-gray-400">{{ t('dashboard.lastTest') }}</span>
          <span class="text-base font-semibold capitalize text-gray-700">{{ lastTest.label }}</span>
        </div>
        <div class="flex flex-col items-end">
          <span class="text-xs uppercase tracking-wide text-gray-400">⭐️ Score</span>
          <span class="text-2xl font-bold text-blue-600">{{ lastTest.score }} <span
              class="text-sm font-medium text-blue-400">pts</span></span>
        </div>
      </div>
    </router-link>
    <HomeChart v-if="tests.length > 0" />
  </ViewContainer>
</template>
