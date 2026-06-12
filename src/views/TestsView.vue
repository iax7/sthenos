<script setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useProfileStore } from '@/stores/useProfileStore.js'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import TestTable from '@/components/TestTable.vue'
import ViewContainer from '@/components/ui/ViewContainer.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'
import { useToasts } from '@/composables/useToasts.js'

const store = useProfileStore()
const { tests } = storeToRefs(store)
const { deleteTest } = store
const { pushToast } = useToasts()
const router = useRouter()
const { t } = useI18n()

const deleteModalOpen = ref(false)
const pendingDelete = ref(null) // { idx, score, date, parts }

function newEntry() {
  router.push('/exercise/new')
}
function onViewTest(i) {
  router.push(`/exercise/${i}`)
}
function onEditTest(i) {
  router.push(`/exercise/${i}/edit`)
}
function onDeleteTest(payload) {
  pendingDelete.value = payload
  deleteModalOpen.value = true
}
function confirmDelete() {
  const ok = deleteTest(pendingDelete.value.idx)
  if (ok) {
    pushToast(t('dashboard.deleteSuccess'), 'success')
  } else {
    pushToast(t('dashboard.deleteFailure'), 'error')
  }
  pendingDelete.value = null
}
</script>

<template>
  <ViewContainer>
    <div class="mb-4 flex justify-end">
      <BaseButton variant="secondary" @click="router.back()">
        <ArrowLeftIcon class="size-5 mr-1" />
        {{ t('app.back') }}
      </BaseButton>
    </div>
    <TestTable :tests="tests" @view="onViewTest" @edit="onEditTest" @delete="onDeleteTest" @new="newEntry" />

    <ConfirmModal v-model:open="deleteModalOpen" :title="t('dashboard.deleteConfirm')"
      :message="pendingDelete ? `${pendingDelete.parts.month}${pendingDelete.parts.day ? ' ' + pendingDelete.parts.day : ''}, ${pendingDelete.parts.year} · ${pendingDelete.score} pts` : ''"
      :confirm-label="t('app.delete')" @confirm="confirmDelete">
      <template #cancel-label>{{ t('app.cancel') }}</template>
    </ConfirmModal>
  </ViewContainer>
</template>
