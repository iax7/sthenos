<script setup>
import { useProfileStore } from '@/composables/useProfileStore.js'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import HomeTable from '@/components/HomeTable.vue'
import HomeChart from '@/components/HomeChart.vue'
import HomeHeader from '@/components/HomeHeader.vue'
import ViewContainer from '@/components/ui/ViewContainer.vue'
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
  <HomeHeader :profile="profile" />
  <HomeTable :tests="tests" @view="onViewTest" @edit="onEditTest" @delete="onDeleteTest" @new="newEntry" />
  <HomeChart v-if="tests.length > 0" />
  </ViewContainer>
</template>
