<script setup>
import { computed, reactive, onMounted, onUnmounted, ref } from "vue";
import BaseButton from "./ui/BaseButton.vue";
import IconDotsVertical from "./icons/IconDotsVertical.vue";
import IconEdit from "./icons/IconEdit.vue";
import IconTrash from "./icons/IconTrash.vue";
import CooperLevelIcon from "./icons/CooperLevelIcon.vue";
import { toKilometers, toMeters, evaluateCooper } from "../services/cooper";
import { loadProfile } from "../services/profileStore.js";
import { PlusIcon } from "@heroicons/vue/24/solid";

const props = defineProps({
  tests: { type: Array, default: () => [] },
});

const profile = loadProfile();
const genderKey = profile?.gender?.toLowerCase() || "m";
const age = profile?.age || 0;

const menuState = reactive({ openIndex: null, position: { top: 0, right: 0 } });

function openMenu(idx, event) {
  if (menuState.openIndex === idx) {
    menuState.openIndex = null;
    return;
  }
  const rect = event.currentTarget.getBoundingClientRect();
  menuState.position.top = rect.bottom + window.scrollY;
  menuState.position.right = window.innerWidth - rect.right;
  menuState.openIndex = idx;
}

function closeOnOutside(e) {
  if (menuState.openIndex === null) return;
  const menuEl = document.querySelector(
    `[data-menu-idx="${menuState.openIndex}"]`,
  );
  const btnEl = document.querySelector(
    `[data-menu-btn="${menuState.openIndex}"]`,
  );
  if (
    menuEl &&
    !menuEl.contains(e.target) &&
    btnEl &&
    !btnEl.contains(e.target)
  ) {
    menuState.openIndex = null;
  }
}

onMounted(() => document.addEventListener("click", closeOnOutside));
onUnmounted(() => document.removeEventListener("click", closeOnOutside));

const rows = computed(() =>
  props.tests.slice().map((r, idx) => {
    const meters = toMeters(r.cooper || 0);
    const level = evaluateCooper(meters, age, genderKey);
    return {
      ...r,
      _cooperMeters: meters,
      _cooperKm: toKilometers(meters),
      _cooperLevel: level,
      _idx: idx,
    };
  }),
);

function formatPrettyDate(dateStr) {
  if (!dateStr) return "";
  const [y, m, rest] = dateStr.split("-");
  const iso = `${y}-${m}-${rest || "01"}`;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return dateStr;
  const locale = navigator?.language || navigator?.userLanguage || "en";
  const monthName = d.toLocaleDateString(locale, { month: "long" });
  return { year: y, month: monthName };
}
</script>

<template>
  <div class="mt-6 w-full overflow-x-auto">
    <div class="mb-3 flex items-center justify-between">
      <h2>Exercise Tests</h2>
      <BaseButton
        type="button"
        variant="primary"
        class="flex items-center gap-1 px-3 py-1.5"
        @click="$emit('new')"
        aria-label="Create new test entry"
      >
        <PlusIcon class="h-5 w-5" />
        <span>New Entry</span>
      </BaseButton>
    </div>
    <table
      class="min-w-full overflow-hidden rounded-md border border-gray-200 bg-white text-sm"
    >
      <thead class="bg-gray-50">
        <tr class="text-left">
          <th class="exercise__cell--title">Date</th>
          <th class="exercise__cell--title">
            <span class="inline text-xs font-bold uppercase sm:hidden">PU</span>
            <span class="hidden sm:inline" title="Pull Ups">Pull Ups</span>
          </th>
          <th class="exercise__cell--title">
            <span class="inline text-xs font-bold uppercase sm:hidden">PS</span>
            <span class="hidden sm:inline" title="Push Ups">Push Ups</span>
          </th>
          <th class="exercise__cell--title">
            <span class="inline text-xs font-bold uppercase sm:hidden"
              >SQT</span
            >
            <span class="hidden sm:inline" title="Squats">Squats</span>
          </th>
          <th class="exercise__cell--title">
            <span class="inline text-xs font-bold uppercase sm:hidden">VU</span>
            <span class="hidden sm:inline" title="V-Ups">V-Ups</span>
          </th>
          <th class="exercise__cell--title">
            <span class="inline text-xs font-bold uppercase sm:hidden"
              >BUR</span
            >
            <span class="hidden sm:inline" title="Burpees">Burpees</span>
          </th>
          <th class="exercise__cell--title">
            <span class="inline text-xs font-bold uppercase sm:hidden">KM</span>
            <span class="hidden sm:inline" title="Km.">Km.</span>
          </th>
          <th class="exercise__cell--title">
            <span class="inline text-xs font-bold uppercase sm:hidden">Ac</span>
            <span class="hidden sm:inline" title="Actions">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(t, i) in rows" :key="i">
          <td class="exercise__cell font-semibold">
            <span class="hidden sm:inline"
              >{{ formatPrettyDate(t.date).year }}&nbsp;</span
            >{{ formatPrettyDate(t.date).month }}
          </td>
          <td class="exercise__cell exercise__cell--numeric">
            {{ t.pullup?.reps }}
          </td>
          <td class="exercise__cell exercise__cell--numeric">
            {{ t.pushup?.reps }}
          </td>
          <td class="exercise__cell exercise__cell--numeric">
            {{ t.squats?.reps }}
          </td>
          <td class="exercise__cell exercise__cell--numeric">
            {{ t.vups?.reps }}
          </td>
          <td class="exercise__cell exercise__cell--numeric">
            {{ t.burpees?.reps }}
          </td>
          <td class="exercise__cell exercise__cell--numeric">
            <div class="flex items-center gap-1">
              <span>{{ t._cooperKm }}</span>
              <CooperLevelIcon :level="t._cooperLevel" :size="16" />
            </div>
          </td>
          <td class="exercise__cell text-right">
            <button
              type="button"
              :data-menu-btn="t._idx"
              class="icon-btn flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100 focus:outline-none"
              @click="openMenu(t._idx, $event)"
              aria-label="Actions"
            >
              <IconDotsVertical />
            </button>
            <Teleport to="body">
              <div
                v-if="menuState.openIndex === t._idx"
                :data-menu-idx="t._idx"
                class="fixed z-50 w-44 rounded-md border border-gray-200 bg-white shadow-lg"
                :style="{
                  top: menuState.position.top + 'px',
                  right: menuState.position.right + 'px',
                }"
              >
                <ul class="py-1 text-sm">
                  <li>
                    <button
                      type="button"
                      class="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-gray-100"
                      @click="
                        $emit('edit', i);
                        menuState.openIndex = null;
                      "
                    >
                      <IconEdit />
                      <span>Edit</span>
                    </button>
                  </li>
                  <hr class="my-1 border-gray-200" />
                  <li>
                    <button
                      type="button"
                      class="flex w-full items-center gap-2 px-3 py-2 text-left text-red-600 hover:bg-red-100"
                      @click="
                        $emit('delete', i);
                        menuState.openIndex = null;
                      "
                    >
                      <IconTrash />
                      <span>Delete</span>
                    </button>
                  </li>
                </ul>
              </div>
            </Teleport>
          </td>
        </tr>
        <tr v-if="rows.length === 0">
          <td colspan="8" class="px-3 py-4 text-center text-gray-500">
            No tests recorded.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
