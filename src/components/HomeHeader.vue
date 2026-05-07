<script setup>
import { computed, ref, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { ageAtDate, todayISO } from "@/composables/useProfileStore.js";

async function sha256hex(str) {
  const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str))
  return Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('')
}

const { t } = useI18n();

const props = defineProps({
  profile: { type: Object, default: () => null },
});

const genderLabel = computed(() => {
  const g = props.profile?.gender;
  if (g === "M") return t("profile.male");
  if (g === "F") return t("profile.female");
  return "";
});

const initials = computed(() => {
  const name = props.profile?.name || "";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase())
    .slice(0, 2)
    .join("");
});

const currentAge = computed(() => {
  if (!props.profile?.dob) return null
  return ageAtDate(props.profile.dob, todayISO())
})

const avatarClass = computed(() =>
  props.profile?.gender === "F"
    ? "bg-gradient-to-br from-pink-400 to-pink-600"
    : "bg-gradient-to-br from-blue-500 to-indigo-600",
);

const gravatarUrl = ref(null)

watchEffect(async () => {
  const email = props.profile?.email?.trim().toLowerCase()
  if (!email) {
    gravatarUrl.value = null
    return
  }
  const hash = await sha256hex(email)
  gravatarUrl.value = `https://gravatar.com/avatar/${hash}?s=112&d=404`
})
</script>

<template>
  <div class="flex items-center gap-4">
    <div
      :class="['flex size-14 shrink-0 items-center justify-center rounded-full text-xl font-bold text-white shadow-lg overflow-hidden', !gravatarUrl ? avatarClass : '']">
      <img v-if="gravatarUrl" :src="gravatarUrl" alt="Avatar" class="size-full object-cover"
        @error="gravatarUrl = null" />
      <template v-else>{{ initials }}</template>
    </div>
    <div class="min-w-0">
      <h1 class="truncate text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
        {{ profile?.name }}
      </h1>
      <p class="text-sm text-gray-500" v-if="profile">
        {{ genderLabel }}<template v-if="currentAge !== null"> · {{ t("profile.age") }}: {{ currentAge }}</template> ·
        <router-link to="/profile" class="link-edit">{{ t("profile.edit") }}</router-link>
      </p>
    </div>
  </div>
</template>
