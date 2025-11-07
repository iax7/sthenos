<script setup>
import { useProfileStore } from '@/composables/useProfileStore.js'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import DashboardTable from '@/components/DashboardTable.vue'
import DashboardChart from '@/components/DashboardChart.vue'
import DashboardHeader from '@/components/DashboardHeader.vue'
import ViewContainer from '@/components/ViewContainer.vue'
import { useToasts } from '@/composables/useToasts.js'

const { profile, tests, deleteTest } = useProfileStore()
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
    <DashboardHeader :profile="profile" />
    <DashboardTable :tests="tests" @view="onViewTest" @edit="onEditTest" @delete="onDeleteTest" @new="newEntry" />
    <DashboardChart v-if="tests.length > 0" />
  </ViewContainer>
</template>
