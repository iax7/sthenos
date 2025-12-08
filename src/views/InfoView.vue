<script setup>
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import BaseButton from '@/components/ui/BaseButton.vue'
import AppCard from '@/components/ui/AppCard.vue'
import ViewContainer from '@/components/ui/ViewContainer.vue'
import CooperLevelIcon from '@/components/icons/CooperLevelIcon.vue'
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'
import {
  PULL_UP_VERSIONS,
  PUSH_UP_VERSIONS,
  SQUAT_VERSIONS,
  VUP_VERSIONS,
  BURPEE_VERSIONS,
  COOPER_MULTIPLIERS,
  COOPER_MAX_SCORE,
} from '@/services/exerciseVersions.js'


const router = useRouter()
const { t } = useI18n()

const exerciseVersions = [
  { title: 'dashboard.table.headers.pullUps', versions: PULL_UP_VERSIONS },
  { title: 'dashboard.table.headers.pushUps', versions: PUSH_UP_VERSIONS },
  { title: 'dashboard.table.headers.squats', versions: SQUAT_VERSIONS },
  { title: 'dashboard.table.headers.vUps', versions: VUP_VERSIONS },
  { title: 'dashboard.table.headers.burpees', versions: BURPEE_VERSIONS },
]

const cooperLevels = [
  { level: 5, labelKey: 'cooper.very_good', multiplier: COOPER_MULTIPLIERS[5] },
  { level: 4, labelKey: 'cooper.good', multiplier: COOPER_MULTIPLIERS[4] },
  { level: 3, labelKey: 'cooper.normal', multiplier: COOPER_MULTIPLIERS[3] },
  { level: 2, labelKey: 'cooper.bad', multiplier: COOPER_MULTIPLIERS[2] },
  { level: 1, labelKey: 'cooper.very_bad', multiplier: COOPER_MULTIPLIERS[1] },
]

function goBack() {
  router.back()
}
</script>

<template>
  <ViewContainer>
    <div class="flex items-center justify-between">
      <h2>
        {{ t('settings.exerciseVersions') }}
      </h2>
      <BaseButton variant="secondary" type="button" @click="goBack">
        <ArrowLeftIcon class="size-5 mr-1" />
        {{ t('app.back') }}
      </BaseButton>
    </div>

    <AppCard>
      <p class="mb-6 text-sm text-gray-600">{{ t('settings.exerciseVersionsDescription') }}</p>

      <!-- Grid responsivo: 1 columna en móvil, 2 en tablet, 3 en desktop -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
        <!-- Exercise Versions -->
        <div
          v-for="exercise in exerciseVersions"
          :key="exercise.title"
          class="border border-gray-200 rounded-lg p-4 bg-white shadow-sm"
        >
          <h4 class="mb-3 font-semibold text-gray-800 text-sm border-b border-gray-300 pb-2">
            {{ t(exercise.title) }}
          </h4>
          <div class="space-y-0">
            <div
              v-for="version in exercise.versions"
              :key="version.value"
              class="flex items-center justify-between py-2 px-2 hover:bg-indigo-50 border-b border-gray-200 last:border-b-0 transition-colors"
            >
              <span class="text-xs text-gray-800 font-medium">{{ t(version.labelKey) }}</span>
              <span class="font-bold text-indigo-600 text-xs tabular-nums">
                {{ Math.round(version.multiplier * 100) }}%
              </span>
            </div>
          </div>
        </div>

        <!-- Cooper Test -->
        <div class="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
          <h4 class="mb-2.5 font-semibold text-gray-800 text-sm border-b border-gray-300 pb-2">
            {{ t('exercise.editor.cooperTest') }}
          </h4>
          <p class="mb-3 text-xs text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-md border border-indigo-100">
            {{ t('settings.cooperMaxScore') }}: <span class="font-bold">{{ COOPER_MAX_SCORE }} pts</span>
          </p>
          <div class="space-y-0">
            <div
              v-for="level in cooperLevels"
              :key="level.level"
              class="flex items-center justify-between py-2 px-2 hover:bg-indigo-50 border-b border-gray-200 last:border-b-0 transition-colors"
            >
              <div class="flex items-center gap-2">
                <CooperLevelIcon :level="level.level" :size="16" />
                <span class="text-xs text-gray-800 font-medium">{{ t(level.labelKey) }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="font-bold text-indigo-600 text-xs tabular-nums">
                  {{ Math.round(level.multiplier * 100) }}%
                </span>
                <span class="text-xs text-gray-600 font-mono bg-gray-200 px-2 py-0.5 rounded tabular-nums font-semibold">
                  {{ Math.round(COOPER_MAX_SCORE * level.multiplier) }} pts
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppCard>

  </ViewContainer>
</template>

