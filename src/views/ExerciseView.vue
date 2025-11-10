<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useProfileStore } from '@/composables/useProfileStore.js'
import { toKilometers, toMeters, evaluateCooper } from '@/services/cooper'
import { calculatePoints, getExcerciseKeys, getVersion, getReps } from '@/services/excercises'
import BaseButton from '@/components/ui/BaseButton.vue'
import AppCard from '@/components/ui/AppCard.vue'
import ViewContainer from '@/components/ui/ViewContainer.vue'
import { PencilIcon, ArrowLeftIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  index: { type: [String, Number], required: true }
})

const { t } = useI18n()
const router = useRouter()
const { profile, tests } = useProfileStore()

const testIndex = computed(() => parseInt(props.index, 10))
const test = computed(() => tests.value[testIndex.value])
const genderKey = profile.value?.gender?.toLowerCase() || 'm'
const age = profile.value?.age || 0

const exerciseData = computed(() => {
  if (!test.value) return null

  const meters = toMeters(test.value.cooper || 0)
  const level = evaluateCooper(meters, age, genderKey)

  const exercises = {}
  getExcerciseKeys().forEach((key) => {
    // Skip cooper as it's displayed separately
    if (key === 'cooper') return

    const version = getVersion(test.value, key)
    const reps = getReps(test.value, key)
    const points = calculatePoints(reps, version)

    exercises[key] = {
      reps,
      versionLabel: version?.labelKey || null,
      // Only round points if there's a version (multiplier applied)
      points: version ? Math.round(points) : points
    }
  })

  return {
    date: test.value.date,
    cooper: {
      laps: test.value.cooper || 0,
      meters,
      km: toKilometers(meters),
      level
    },
    exercises
  }
})

function formatPrettyDate(dateStr) {
  if (!dateStr) return ''
  const [y, m, rest] = dateStr.split('-')
  const iso = `${y}-${m}-${rest || '01'}`
  const d = new Date(iso)
  if (isNaN(d.getTime())) return dateStr
  const locale = navigator?.language || navigator?.userLanguage || 'en'
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  return d.toLocaleDateString(locale, options)
}

function goBack() {
  router.back()
}

function editTest() {
  router.push({ name: 'exercise-edit', params: { index: testIndex.value } })
}

const exerciseLabels = {
  pullup: 'dashboard.table.headers.pullUps',
  pushup: 'dashboard.table.headers.pushUps',
  squats: 'dashboard.table.headers.squats',
  vups: 'dashboard.table.headers.vUps',
  burpees: 'dashboard.table.headers.burpees'
}

const cooperLevelConfig = {
  1: { bg: '#dc2626', text: '#fff', labelKey: 'cooper.very_bad' },
  2: { bg: '#f97316', text: '#fff', labelKey: 'cooper.bad' },
  3: { bg: '#facc15', text: '#000', labelKey: 'cooper.normal' },
  4: { bg: '#22c55e', text: '#fff', labelKey: 'cooper.good' },
  5: { bg: '#0ea5e9', text: '#fff', labelKey: 'cooper.very_good' },
}

const cooperLevelStyle = computed(() => {
  const level = exerciseData.value?.cooper?.level
  const config = cooperLevelConfig[level] || { bg: '#6b7280', text: '#fff', labelKey: 'cooper.na' }
  return {
    backgroundColor: config.bg,
    color: config.text,
    labelKey: config.labelKey
  }
})

const totalScore = computed(() => {
  if (!exerciseData.value) return 0
  const exercises = exerciseData.value.exercises
  return Object.values(exercises).reduce((sum, exercise) => sum + exercise.points, 0)
})
</script>

<template>
  <ViewContainer>
    <div class="mb-4 flex items-center justify-between">
      <h2>
        {{ t('exercise.editor.testDate') }}
      </h2>
      <div class="flex items-center gap-2">
        <BaseButton
          variant="secondary"
          type="button"
          @click="goBack"
          aria-label="Back to dashboard"
        >
          <ArrowLeftIcon class="size-5 mr-1" />
          {{ t('app.back') }}
        </BaseButton>
        <BaseButton
          v-if="exerciseData"
          variant="primary"
          type="button"
          @click="editTest"
          aria-label="Edit exercise"
        >
          <PencilIcon class="size-5 mr-1" />
          {{ t('dashboard.table.actions.edit') }}
        </BaseButton>
      </div>
    </div>

    <AppCard v-if="!exerciseData" class="p-6 text-center">
      <p class="text-gray-500">{{ t('exercise.editor.invalidTest') }}</p>
    </AppCard>

    <div v-else>
      <AppCard>
        <p class="text-lg font-semibold text-gray-700">
          {{ formatPrettyDate(exerciseData.date) }}
        </p>
      </AppCard>

      <AppCard class="bg-linear-to-br from-indigo-500 to-purple-600 text-white relative overflow-hidden">
        <!-- Star watermark -->
        <svg
          class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[calc(100%+2rem)] w-auto opacity-20"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#ffd700;stop-opacity:1" />
              <stop offset="50%" style="stop-color:#ffed4e;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#ffa500;stop-opacity:1" />
            </linearGradient>
          </defs>
          <polygon
            points="50,15 61,40 88,40 67,57 74,82 50,67 26,82 33,57 12,40 39,40"
            fill="url(#goldGradient)"
          />
        </svg>
        <div class="text-center relative z-10">
          <h2 class="mb-2 text-lg font-semibold uppercase tracking-wide opacity-90">
            Score
          </h2>
          <p class="text-6xl font-bold">
            {{ totalScore }}
          </p>
          <p class="mt-2 text-sm opacity-75">
            {{ t('exercise.editor.totalPoints') }}
          </p>
        </div>
      </AppCard>

      <AppCard>
        <h2 class="mb-4 text-xl font-semibold text-gray-700">
          {{ t('exercise.editor.cooperTest') }}
        </h2>
        <div class="flex items-center gap-4">
          <div class="flex-1">
            <p class="text-sm text-gray-600">{{ t('exercise.editor.cooperLaps') }}</p>
            <p class="text-3xl font-bold text-blue-600">{{ exerciseData.cooper.km }} km</p>
            <p class="text-sm text-gray-500">({{ exerciseData.cooper.meters }} {{ t('dashboard.table.headers.km') === 'Km.' ? 'meters' : 'metros' }}) · {{ exerciseData.cooper.laps }} {{ t('cooper.laps') }}</p>
          </div>
          <div class="flex items-center gap-2">
            <span
              class="rounded-lg px-4 py-2 text-sm font-bold uppercase tracking-wide"
              :style="{
                backgroundColor: cooperLevelStyle.backgroundColor,
                color: cooperLevelStyle.color
              }"
            >
              {{ t(cooperLevelStyle.labelKey) }}
            </span>
          </div>
        </div>
      </AppCard>

      <AppCard>
        <h2 class="mb-4 text-xl font-semibold text-gray-700">
          {{ t('dashboard.table.title') }}
        </h2>
        <div class="grid gap-3 grid-cols-1 min-[350px]:grid-cols-2 sm:grid-cols-4 lg:grid-cols-5">
          <div
            v-for="(key, idx) in Object.keys(exerciseData.exercises)"
            :key="idx"
            class="rounded-lg border border-gray-200 bg-linear-to-br from-white via-blue-50 to-indigo-100 p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 class="mb-2 text-sm font-semibold uppercase text-gray-700">
              {{ t(exerciseLabels[key]) }}
            </h3>
            <div class="mb-2">
              <p class="text-2xl font-bold text-gray-800">
                {{ exerciseData.exercises[key].reps }}
              </p>
              <p class="text-xs text-gray-500">
                {{ t('exercise.editor.count') }}
              </p>
            </div>
            <div class="mb-2">
              <p class="text-lg font-semibold text-blue-600">
                {{ exerciseData.exercises[key].points }} pts
              </p>
            </div>
            <div v-if="exerciseData.exercises[key].versionLabel">
              <span class="inline-block rounded-md bg-linear-to-r from-orange-500 to-amber-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                {{ t(exerciseData.exercises[key].versionLabel) }}
              </span>
            </div>
          </div>
        </div>
      </AppCard>
    </div>
  </ViewContainer>
</template>
