<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToasts } from '@/composables/useToasts.js'
import { useProfileStore, ageAtDate, todayISO } from '@/composables/useProfileStore.js'
import { useRouter } from 'vue-router'
import AppCard from '@/components/ui/AppCard.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import ViewContainer from '@/components/ui/ViewContainer.vue'
import { UserCircleIcon } from '@heroicons/vue/24/outline'

const { t } = useI18n()
const { pushToast } = useToasts()
const router = useRouter()
const { profile, saveProfile } = useProfileStore()

// Reactive state
const name = ref('')
const gender = ref('')
const email = ref('')
const dob = ref('')
const isEditing = ref(false)

// Initialize from store
if (profile.value) {
  name.value = profile.value.name
  gender.value = profile.value.gender
  email.value = profile.value.email || ''
  dob.value = profile.value.dob || ''
  isEditing.value = true
}

const MIN_AGE = 11
const MAX_AGE = 120

const dobError = computed(() => {
  if (!dob.value) return null
  if (isNaN(new Date(dob.value).getTime())) return null
  const age = ageAtDate(dob.value, todayISO())
  if (age < MIN_AGE) return t('profile.dobTooYoung')
  if (age > MAX_AGE) return t('profile.dobTooOld')
  return null
})

const canSave = computed(
  () => name.value.trim() && (gender.value === 'M' || gender.value === 'F') && dob.value && !dobError.value,
)

function save() {
  if (!canSave.value) return
  saveProfile({ name: name.value, gender: gender.value, email: email.value, dob: dob.value })
  pushToast(t(isEditing.value ? 'profile.updateSuccess' : 'profile.saveSuccess'), 'success')
  router.push('/')
}

function cancel() {
  router.back()
}
</script>

<template>
  <ViewContainer class="max-w-md">
    <div class="mb-6">
      <div class="flex items-center gap-3">
        <UserCircleIcon class="size-8 text-blue-600" />
        <h1 class="text-3xl font-bold text-gray-900">{{ t('profile.title') }}</h1>
      </div>
    </div>

    <AppCard>
      <form @submit.prevent="save" class="space-y-6">
        <!-- Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ t('profile.name') }}
          </label>
          <BaseInput v-model="name" :placeholder="t('profile.namePlaceholder')" required class="w-full" />
        </div>

        <!-- Gender -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ t('profile.gender') }}
          </label>
          <div class="inline-flex rounded-lg bg-gray-100 p-1 w-full">
            <label class="flex-1 cursor-pointer">
              <input type="radio" class="peer sr-only" value="M" v-model="gender" required />
              <span
                class="block rounded-md px-4 py-2.5 text-center text-sm font-medium transition-all text-gray-600 hover:text-gray-900 peer-checked:bg-white peer-checked:text-gray-900 peer-checked:shadow-sm">
                {{ t('profile.male') }}
              </span>
            </label>
            <label class="flex-1 cursor-pointer">
              <input type="radio" class="peer sr-only" value="F" v-model="gender" required />
              <span
                class="block rounded-md px-4 py-2.5 text-center text-sm font-medium transition-all text-gray-600 hover:text-gray-900 peer-checked:bg-white peer-checked:text-gray-900 peer-checked:shadow-sm">
                {{ t('profile.female') }}
              </span>
            </label>
          </div>
        </div>

        <!-- Date of Birth -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ t('profile.dob') }}
          </label>
          <BaseInput v-model="dob" type="date" class="w-full" />
          <p v-if="dobError" class="mt-1 text-sm text-red-600">{{ dobError }}</p>
        </div>

        <!-- Email -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ t('profile.email') }}
          </label>
          <BaseInput v-model="email" type="email" :placeholder="t('profile.emailPlaceholder')" class="w-full" />
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3 pt-2">
          <BaseButton v-if="isEditing" type="button" variant="secondary" @click="cancel">
            {{ t('app.cancel') }}
          </BaseButton>
          <BaseButton type="submit" :disabled="!canSave">
            {{ isEditing ? t('app.update') : t('app.save') }}
          </BaseButton>
        </div>
      </form>
    </AppCard>
  </ViewContainer>
</template>
