<script setup>
import { ref, computed } from 'vue'
import { useToasts } from '../composables/useToasts.js'
import { loadProfile, saveProfile } from '../services/profileStore.js'
import { useRouter } from 'vue-router'
import Card from './ui/Card.vue'
import BaseInput from './ui/BaseInput.vue'
import BaseButton from './ui/BaseButton.vue'
import BaseNumberStepper from './ui/BaseNumberStepper.vue'

// Reactive state
const name = ref('')
const gender = ref('')
const age = ref('')
// Determine if editing existing profile
const isEditing = ref(false)
// Removed tests/edit state for root edit-only screen
// menu removed (handled globally)
const { pushToast } = useToasts()
const router = useRouter()
// UI lock removed (managed externally if needed)

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
            <label class="form-label">Name</label>
            <BaseInput v-model="name" placeholder="Your name" required />
          </div>
          <div class="flex flex-col">
            <label class="form-label">Gender</label>
            <div class="space-y-2">
              <label
                :class="[
                  'group block w-full cursor-pointer select-none rounded-md border px-4 py-3 transition focus-within:ring-2 focus-within:ring-blue-500',
                  gender === 'M' ? 'border-blue-500 bg-blue-50/80 shadow-sm' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                ]"
              >
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium text-gray-800">Male</span>
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
                  <span class="text-sm font-medium text-gray-800">Female</span>
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
            <label class="form-label">Age</label>
            <BaseNumberStepper v-model="age" :min="11" :max="120" :step="1" label="Age" />
          </div>
          <div class="flex gap-2 justify-end">
            <BaseButton type="submit" :disabled="!canSave">{{ isEditing ? 'Update' : 'Save' }}</BaseButton>
            <BaseButton v-if="isEditing" type="button" variant="secondary" @click="cancel">Cancel</BaseButton>
          </div>
        </form>
    </Card>
</template>
