<script setup>
import { computed } from 'vue'

const props = defineProps({
  profile: { type: Object, default: () => null }
})

const genderLabel = computed(() => {
  const g = props.profile?.gender
  if (g === 'M') return 'Male'
  if (g === 'F') return 'Female'
  return ''
})
</script>

<template>
  <div class="mb-6 flex items-start justify-between">
    <div>
      <h1 class="font-bold tracking-tight text-blue-800 text-5xl">{{ profile?.name }}</h1>
      <p class="text-sm text-gray-600" v-if="profile">
        Gender: {{ genderLabel }} · Age: {{ profile?.age }}
      </p>
    </div>
    <router-link to="/profile" class="link-edit">Edit Profile</router-link>
  </div>
</template>
