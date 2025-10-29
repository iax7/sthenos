<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToasts } from '@/composables/useToasts.js'
import { loadProfile, saveProfile } from '@/services/profileStore.js'
import { useRouter } from 'vue-router'
import Card from '@/components/ui/Card.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseNumberStepper from '@/components/ui/BaseNumberStepper.vue'

const { t } = useI18n()

// Reactive state
const name = ref('')
const gender = ref('')
const age = ref('')
const isEditing = ref(false)
const { pushToast } = useToasts()
const router = useRouter()

// Initialize from store
const existing = loadProfile()
if (existing) {
  name.value = existing.name
  gender.value = existing.gender
  age.value = existing.age
  isEditing.value = true
}

const canSave = computed(() => name.value.trim() && (gender.value === 'M' || gender.value === 'F') && age.value)

function save() {
  if (!canSave.value) return
  saveProfile({ name: name.value, gender: gender.value, age: age.value })
  pushToast(t(isEditing.value ? 'profile.updateSuccess' : 'profile.saveSuccess'), 'success')
  // navigate to dashboard root after profile exists
  router.push('/')
}

function cancel() {
  // Navigate back without discarding current edits (acts as cancel of edit mode)
  router.push('/')
}
</script>

<template>
    <Card>
        <form @submit.prevent="save" class="space-y-4">
          <div class="flex flex-col">
            <label class="form-label">{{ t('profile.name') }}</label>
            <BaseInput v-model="name" :placeholder="t('profile.namePlaceholder')" required />
          </div>
          <div class="flex flex-col">
            <label class="form-label">{{ t('profile.gender') }}</label>
            <div class="space-y-2">
              <label
                :class="[
                  'group block w-full cursor-pointer select-none rounded-md border px-4 py-3 transition focus-within:ring-2 focus-within:ring-blue-500',
                  gender === 'M' ? 'border-blue-500 bg-blue-50/80 shadow-sm' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                ]"
              >
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium text-gray-800">{{ t('profile.male') }}</span>
                  <input
                    type="radio"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    value="M"
                    v-model="gender"
                    required
                  />
                </div>
              </label>
              <label
                :class="[
                  'group block w-full cursor-pointer select-none rounded-md border px-4 py-3 transition focus-within:ring-2 focus-within:ring-blue-500',
                  gender === 'F' ? 'border-blue-500 bg-blue-50/80 shadow-sm' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                ]"
              >
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium text-gray-800">{{ t('profile.female') }}</span>
                  <input
                    type="radio"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    value="F"
                    v-model="gender"
                    required
                  />
                </div>
              </label>
            </div>
          </div>
          <div class="flex flex-col">
            <label class="form-label">{{ t('profile.age') }}</label>
            <BaseNumberStepper v-model="age" :min="11" :max="120" :step="1" :label="t('profile.age')" />
          </div>
          <div class="flex gap-2 justify-end">
            <BaseButton type="submit" :disabled="!canSave">{{ isEditing ? t('app.update') : t('app.save') }}</BaseButton>
            <BaseButton v-if="isEditing" type="button" variant="secondary" @click="cancel">{{ t('app.cancel') }}</BaseButton>
          </div>
        </form>
    </Card>
</template>
