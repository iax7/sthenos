<script setup>
import { ref, computed, watch } from 'vue'
import Card from './ui/Card.vue'
import BaseInput from './ui/BaseInput.vue'
import BaseButton from './ui/BaseButton.vue'
import ExerciseMetricInput from './ExerciseMetricInput.vue'
import { appendTest, updateTest } from '../services/profileStore.js'
import { useToasts } from '../composables/useToasts.js'
import { PULL_UP_VERSIONS, PUSH_UP_VERSIONS, SQUAT_VERSIONS, VUP_VERSIONS, BURPEE_VERSIONS } from '../services/exerciseVersions.js'
import { BackwardIcon } from '@heroicons/vue/24/solid'

const props = defineProps({
  mode: { type: String, default: 'create' }, // 'create' | 'edit'
  index: { type: Number, default: null }, // required for edit
  test: { type: Object, default: null }
})
const emit = defineEmits(['done','cancel'])
const { pushToast } = useToasts()

function todayISO() { return new Date().toISOString().slice(0,10) }

// state
const date = ref(props.mode==='edit' && props.test?.date ? props.test.date : todayISO())
const pullUps = ref(props.mode==='edit' ? (props.test?.pullup?.reps ?? 0) : '')
const pullUpsVersion = ref(props.mode==='edit' ? (props.test?.pullup?.version ?? props.test?.pullUpsVersion ?? '') : '')
const pushUps = ref(props.mode==='edit' ? (props.test?.pushup?.reps ?? 0) : '')
const pushUpsVersion = ref(props.mode==='edit' ? (props.test?.pushup?.version ?? props.test?.pushUpsVersion ?? '') : '')
const squats = ref(props.mode==='edit' ? (props.test?.squats?.reps ?? 0) : '')
const squatsVersion = ref(props.mode==='edit' ? (props.test?.squats?.version ?? props.test?.squatsVersion ?? '') : '')
const vups = ref(props.mode==='edit' ? (props.test?.vups?.reps ?? 0) : '')
const vupsVersion = ref(props.mode==='edit' ? (props.test?.vups?.version ?? props.test?.vupsVersion ?? '') : '')
const burpees = ref(props.mode==='edit' ? (props.test?.burpees?.reps ?? 0) : '')
const burpeesVersion = ref(props.mode==='edit' ? (props.test?.burpees?.version ?? props.test?.burpeesVersion ?? '') : '')
const laps = ref(props.mode==='edit' ? (props.test?.cooper ?? props.test?.laps ?? 0) : '')

watch(() => props.test, (t) => {
  if (props.mode==='edit' && t) {
    date.value = t.date
    pullUps.value = t.pullup?.reps ?? t.pullUps ?? 0
    pullUpsVersion.value = t.pullup?.version ?? t.pullUpsVersion ?? ''
    pushUps.value = t.pushup?.reps ?? t.pushUps ?? 0
    pushUpsVersion.value = t.pushup?.version ?? t.pushUpsVersion ?? ''
    squats.value = t.squats?.reps ?? t.squats ?? 0
    squatsVersion.value = t.squats?.version ?? t.squatsVersion ?? ''
    vups.value = t.vups?.reps ?? t.vups ?? 0
    vupsVersion.value = t.vups?.version ?? t.vupsVersion ?? ''
    burpees.value = t.burpees?.reps ?? t.burpees ?? 0
    burpeesVersion.value = t.burpees?.version ?? t.burpeesVersion ?? ''
    laps.value = t.cooper ?? t.laps ?? 0
  }
})

const canSave = computed(() => {
  const dateOk = date.value && /\d{4}-\d{2}-\d{2}/.test(date.value)
  const fields = [pullUps, pullUpsVersion, pushUps, pushUpsVersion, squats, squatsVersion, vups, vupsVersion, burpees, burpeesVersion, laps]
  return dateOk && fields.every(f => String(f.value).trim() !== '')
})

function save() {
  if (!canSave.value) return
  const payload = {
    date: date.value,
    pullUps: pullUps.value,
    pullUpsVersion: pullUpsVersion.value,
    pushUps: pushUps.value,
    pushUpsVersion: pushUpsVersion.value,
    squats: squats.value,
    squatsVersion: squatsVersion.value,
    vups: vups.value,
    vupsVersion: vupsVersion.value,
    burpees: burpees.value,
    burpeesVersion: burpeesVersion.value,
    laps: laps.value
  }
  if (props.mode === 'edit') {
    const updated = updateTest(props.index, payload)
    if (updated) {
      pushToast('Test updated', 'success')
    } else {
      pushToast('Failed to update test', 'error')
    }
  } else {
    const created = appendTest(payload)
    if (created) {
      pushToast('Test created', 'success')
    } else {
      pushToast('Failed to create test', 'error')
    }
  }
  // Notify other parts of the app to refresh
  window.dispatchEvent(new CustomEvent('profile-updated'))
  emit('done')
}
</script>

<template>
  <Card>
    <form @submit.prevent="save" class="space-y-4">
      <div class="flex flex-col">
        <label class="form-label">Date</label>
        <BaseInput v-model="date" type="date" required />
      </div>
      <div class="space-y-4">
        <ExerciseMetricInput label="Pull Ups" v-model:count="pullUps" v-model:version="pullUpsVersion" :versions="PULL_UP_VERSIONS" />
        <ExerciseMetricInput label="Push Ups" v-model:count="pushUps" v-model:version="pushUpsVersion" :versions="PUSH_UP_VERSIONS" />
        <ExerciseMetricInput label="Squats" v-model:count="squats" v-model:version="squatsVersion" :versions="SQUAT_VERSIONS" />
        <ExerciseMetricInput label="V-Ups" v-model:count="vups" v-model:version="vupsVersion" :versions="VUP_VERSIONS" />
        <ExerciseMetricInput label="Burpees" v-model:count="burpees" v-model:version="burpeesVersion" :versions="BURPEE_VERSIONS" />
        <div class="flex flex-col">
          <label class="form-label">Laps</label>
          <BaseInput v-model="laps" type="number" min="0" step="0.5" placeholder="Count" required />
        </div>
      </div>
      <div class="flex gap-2 justify-end">
        <BaseButton type="submit" :disabled="!canSave">{{ props.mode==='edit' ? 'Update' : 'Save' }}</BaseButton>
        <BaseButton variant="secondary" type="button" @click="emit('cancel')">Cancel</BaseButton>
      </div>
    </form>
  </Card>
</template>
