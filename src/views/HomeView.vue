<script setup>
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useProfileStore, ageAtDate } from '@/stores/useProfileStore.js'
import { useI18n } from 'vue-i18n'
import HomeChart from '@/components/HomeChart.vue'
import HomeHeader from '@/components/HomeHeader.vue'
import ViewContainer from '@/components/ui/ViewContainer.vue'
import { calculateTotalScore } from '@/services/exercises.js'
import { toMeters, evaluateCooper } from '@/services/cooper.js'
import { ChevronRightIcon, PencilIcon } from '@heroicons/vue/24/outline'
import { useRouter } from 'vue-router'

const router = useRouter()
const store = useProfileStore()
const { profile, tests } = storeToRefs(store)

const lastTestIndex = computed(() => tests.value.length - 1)

function editLastTest(e) {
  e.preventDefault()
  router.push(`/exercise/${lastTestIndex.value}/edit`)
}
const { t, locale } = useI18n()

const lastTest = computed(() => {
  if (!tests.value?.length) return null
  const test = tests.value[tests.value.length - 1]
  const age = ageAtDate(profile.value?.dob, test.date)
  const genderKey = profile.value?.gender?.toLowerCase() || 'm'
  const meters = toMeters(test.cooper || 0)
  const level = evaluateCooper(meters, age, genderKey)
  const score = calculateTotalScore(test, level)

  const [y, m, d] = (test.date || '').split('-')
  const date = new Date(Number(y), Number(m) - 1, Number(d || 1))
  const month = date.toLocaleDateString(locale.value, { month: 'long' })
  const day = d && d !== '01' ? String(parseInt(d, 10)) : ''

  let scoreDiff = null
  if (tests.value.length >= 2) {
    const prev = tests.value[tests.value.length - 2]
    const prevAge = ageAtDate(profile.value?.dob, prev.date)
    const prevMeters = toMeters(prev.cooper || 0)
    const prevLevel = evaluateCooper(prevMeters, prevAge, genderKey)
    const prevScore = calculateTotalScore(prev, prevLevel)
    scoreDiff = score - prevScore
  }

  return { year: y, month, day, score, scoreDiff }
})
</script>

<template>
  <ViewContainer>
    <HomeHeader :profile="profile" />
    <router-link to="/tests"
      class="mt-4 flex flex-col rounded-lg border border-gray-200 bg-white px-4 py-4 shadow-sm hover:bg-gray-50">
      <div class="flex items-center justify-between">
        <span class="text-lg font-semibold text-gray-800">{{ t('dashboard.table.title') }}</span>
        <span class="text-sm text-gray-400 flex items-center gap-1">{{ tests.length }} {{ t('nav.entries') }}
          <ChevronRightIcon class="size-4" />
        </span>
      </div>
      <div v-if="lastTest" class="mt-3 flex items-start justify-between border-t border-gray-100 pt-3">
        <div class="flex flex-col">
          <span class="text-xs uppercase tracking-wide text-gray-400">{{ t('dashboard.lastTest') }}</span>
          <span class="text-base font-semibold text-gray-700 flex items-center">
            {{ lastTest.year }} <span class="capitalize ml-1">{{ lastTest.month }}</span><span v-if="lastTest.day"
              class="ml-1 text-sm font-normal text-gray-400">{{ lastTest.day }}</span>
          </span>
        </div>
        <div class="flex items-center gap-3">
          <div class="flex flex-col items-end">
            <span class="text-xs uppercase tracking-wide text-gray-400">⭐️ Score</span>
            <span class="text-2xl font-bold text-blue-600">{{ lastTest.score }} <span
                class="text-sm font-medium text-blue-400">pts</span></span>
            <span v-if="lastTest.scoreDiff !== null" class="text-xs font-medium"
              :class="lastTest.scoreDiff >= 0 ? 'text-green-600' : 'text-red-500'">
              {{ lastTest.scoreDiff >= 0 ? '+' : '' }}{{ lastTest.scoreDiff }} pts
            </span>
          </div>
          <button @click="editLastTest"
            class="rounded-lg border border-gray-200 p-2.5 text-blue-400 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            :aria-label="t('exercise.edit')">
            <PencilIcon class="size-5" />
          </button>
        </div>
      </div>
    </router-link>
    <HomeChart v-if="tests.length > 0" />
  </ViewContainer>
</template>
