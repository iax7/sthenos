<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useProfileStore } from '@/composables/useProfileStore.js'
import { toKilometers, toMeters, evaluateCooper } from '@/services/cooper'
import { calculatePoints, getExcerciseKeys, getVersion, getReps } from '@/services/excercises'
import BaseButton from '@/components/ui/BaseButton.vue'
import AppCard from '@/components/ui/AppCard.vue'
import CooperLevelIcon from '@/components/icons/CooperLevelIcon.vue'
import ViewContainer from '@/components/ViewContainer.vue'
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
      points: Math.round(points)
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
  router.push({ name: 'dashboard' })
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

      <AppCard>
        <h2 class="mb-4 text-xl font-semibold text-gray-700">
          {{ t('exercise.editor.cooperTest') }}
        </h2>
        <div class="flex items-center gap-4">
          <div class="flex-1">
            <p class="text-sm text-gray-600">{{ t('exercise.editor.cooperLaps') }}</p>
            <p class="text-3xl font-bold text-blue-600">{{ exerciseData.cooper.km }} km</p>
            <p class="text-sm text-gray-500">({{ exerciseData.cooper.meters }} {{ t('dashboard.table.headers.km') === 'Km.' ? 'meters' : 'metros' }}) · {{ exerciseData.cooper.laps }}</p>
          </div>
          <div class="flex items-center gap-2">
            <CooperLevelIcon
              :level="exerciseData.cooper.level"
              :showText="true"
              class="size-16"
            />
          </div>
        </div>
      </AppCard>

      <AppCard>
        <h2 class="mb-4 text-xl font-semibold text-gray-700">
          {{ t('dashboard.table.title') }}
        </h2>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="(key, idx) in Object.keys(exerciseData.exercises)"
            :key="idx"
            class="rounded-lg border border-gray-200 bg-gray-50 p-4"
          >
            <h3 class="mb-2 text-sm font-semibold uppercase text-gray-600">
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
            <div v-if="exerciseData.exercises[key].versionLabel" class="text-xs text-gray-500">
              <span class="rounded bg-gray-200 px-2 py-1">
                {{ t(exerciseData.exercises[key].versionLabel) }}
              </span>
            </div>
          </div>
        </div>
      </AppCard>
    </div>
  </ViewContainer>
</template>
