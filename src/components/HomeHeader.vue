<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";

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

const avatarClass = computed(() =>
  props.profile?.gender === "F"
    ? "bg-gradient-to-br from-pink-400 to-pink-600"
    : "bg-gradient-to-br from-blue-500 to-indigo-600",
);
</script>

<template>
  <div class="flex items-center gap-4">
    <div
      :class="['flex size-14 shrink-0 items-center justify-center rounded-full text-xl font-bold text-white shadow-md', avatarClass]"
    >
      {{ initials }}
    </div>
    <div class="min-w-0">
      <h1 class="truncate text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
        {{ profile?.name }}
      </h1>
      <p class="text-sm text-gray-500" v-if="profile">
        {{ genderLabel }} · {{ t("profile.age") }}: {{ profile?.age }} ·
        <router-link to="/profile" class="link-edit">{{ t("profile.edit") }}</router-link>
      </p>
    </div>
  </div>
</template>
