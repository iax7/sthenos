<script setup>
import { computed } from 'vue'
import BaseButton from './ui/BaseButton.vue'
import IconEdit from './icons/IconEdit.vue'
import IconTrash from './icons/IconTrash.vue'
import CooperLevelIcon from './icons/CooperLevelIcon.vue'
import { toKilometers, toMeters, evaluateCooper } from '../services/cooper'
import { loadProfile } from '../services/profileStore.js'

const props = defineProps({
  tests: { type: Array, default: () => [] }
})

const profile = loadProfile()
const genderKey = profile?.gender?.toLowerCase() || 'm'
const age = profile?.age || 0
const rows = computed(() => props.tests.slice().map(r => {
  const meters = toMeters(r.cooper || 0)
  const level = evaluateCooper(meters, age, genderKey)
  return { ...r, _cooperMeters: meters, _cooperKm: toKilometers(meters), _cooperLevel: level }
}))

function formatPrettyDate(dateStr) {
  if (!dateStr) return ''
  const [y,m,rest] = dateStr.split('-')
  const iso = `${y}-${m}-${rest || '01'}`
  const d = new Date(iso)
  if (isNaN(d.getTime())) return dateStr
  const locale = navigator?.language || navigator?.userLanguage || 'en'
  const monthName = d.toLocaleDateString(locale, { month: 'long' })
  return `${y} ${monthName}`
}
</script>

<template>
  <div class="w-full overflow-x-auto mt-6">
    <div class="flex items-center justify-between mb-3">
      <h2>Exercise Tests</h2>
      <BaseButton
        type="button"
        variant="primary"
        class="flex items-center gap-1 px-3 py-1.5"
        @click="$emit('new')"
        aria-label="Create new test entry"
      >
        <span>+ New Entry</span>
      </BaseButton>
    </div>
    <table class="min-w-full text-sm border border-gray-200 bg-white rounded-md overflow-hidden">
      <thead class="bg-gray-50">
        <tr class="text-left">
          <th class="exercise__cell--title">Date</th>
          <th class="exercise__cell--title">Pull Ups</th>
          <th class="exercise__cell--title">Push Ups</th>
          <th class="exercise__cell--title">Squats</th>
          <th class="exercise__cell--title">V-Ups</th>
          <th class="exercise__cell--title">Burpees</th>
          <th class="exercise__cell--title">Km.</th>
          <th class="exercise__cell--title text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(t,i) in rows" :key="i">
          <td class="exercise__cell font-semibold">{{ formatPrettyDate(t.date) }}</td>
          <td class="exercise__cell exercise__cell--numeric">{{ t.pullup?.reps }}</td>
          <td class="exercise__cell exercise__cell--numeric">{{ t.pushup?.reps }}</td>
          <td class="exercise__cell exercise__cell--numeric">{{ t.squats?.reps }}</td>
          <td class="exercise__cell exercise__cell--numeric">{{ t.vups?.reps }}</td>
          <td class="exercise__cell exercise__cell--numeric">{{ t.burpees?.reps }}</td>
          <td class="exercise__cell exercise__cell--numeric">
            <div class="flex items-center gap-1">
              <span>{{ t._cooperKm }}</span>
              <CooperLevelIcon :level="t._cooperLevel" :size="16" />
            </div>
          </td>
          <td class="exercise__cell text-right">
            <button type="button" class="icon-btn inline-flex items-center justify-center w-7 h-7" @click="$emit('edit', i)" aria-label="Edit test">
              <IconEdit />
            </button>
            <button type="button" class="icon-btn icon-btn-danger inline-flex items-center justify-center w-7 h-7" @click="$emit('delete', i)" aria-label="Delete test">
              <IconTrash />
            </button>
          </td>
        </tr>
        <tr v-if="rows.length === 0">
          <td colspan="8" class="px-3 py-4 text-center text-gray-500">No tests recorded.</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
