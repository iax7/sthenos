<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import ExerciseForm from '@/components/ExerciseForm.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import ViewContainer from '@/components/ui/ViewContainer.vue'
import { ArrowLeftIcon, EyeIcon } from '@heroicons/vue/24/outline'
import { useProfileStore } from '@/composables/useProfileStore.js'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { tests } = useProfileStore()

const isEdit = route.name === 'exercise-edit'
const index = isEdit ? Number(route.params.index) : null
const test = isEdit && tests.value[index] ? { ...tests.value[index] } : null

function goBack() {
  router.push('/')
}

function viewTest() {
  if (isEdit && index !== null) {
    router.push({ name: 'exercise-view', params: { index } })
  }
}
</script>

<template>
  <ViewContainer>
    <div class="mb-4 flex items-center justify-between">
      <h2>
        {{ isEdit ? t('exercise.editor.titleEdit') : t('exercise.editor.titleNew') }}
      </h2>
      <div class="flex items-center gap-2">
        <BaseButton variant="secondary" type="button" @click="goBack">
          <ArrowLeftIcon class="size-5 mr-1" />
          {{ t('app.back') }}
        </BaseButton>
        <BaseButton
          v-if="isEdit"
          variant="primary"
          type="button"
          @click="viewTest"
          aria-label="View exercise"
        >
          <EyeIcon class="size-5 mr-1" />
          {{ t('dashboard.table.actions.view') }}
        </BaseButton>
      </div>
    </div>
    <ExerciseForm
      v-if="isEdit && test"
      mode="edit"
      :index="index"
      :test="test"
      @done="goBack"
      @cancel="goBack"
    />
    <ExerciseForm v-else mode="create" @done="goBack" @cancel="goBack" />
  </ViewContainer>
</template>
