<script setup>
import { useProfileStore } from '@/composables/useProfileStore.js'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import TestTable from '@/components/TestTable.vue'
import ViewContainer from '@/components/ui/ViewContainer.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'
import { useToasts } from '@/composables/useToasts.js'

const { tests, deleteTest } = useProfileStore()
const { pushToast } = useToasts()
const router = useRouter()
const { t } = useI18n()

function newEntry() {
  router.push('/exercise/new')
}
function onViewTest(i) {
  router.push(`/exercise/${i}`)
}
function onEditTest(i) {
  router.push(`/exercise/${i}/edit`)
}
function onDeleteTest(i) {
  if (!confirm(t('dashboard.deleteConfirm'))) return
  const ok = deleteTest(i)
  if (ok) {
    pushToast(t('dashboard.deleteSuccess'), 'success')
  } else {
    pushToast(t('dashboard.deleteFailure'), 'error')
  }
}
</script>

<template>
  <ViewContainer>
    <div class="mb-4">
      <BaseButton variant="secondary" @click="router.back()">
        <ArrowLeftIcon class="size-5 mr-1" />
        {{ t('app.back') }}
      </BaseButton>
    </div>
    <TestTable :tests="tests" @view="onViewTest" @edit="onEditTest" @delete="onDeleteTest" @new="newEntry" />
  </ViewContainer>
</template>
