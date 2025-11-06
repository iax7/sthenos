<script setup>
import { computed, reactive, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import BaseButton from "@/components/ui/BaseButton.vue";
import IconDotsVertical from "@/components/icons/IconDotsVertical.vue";
import CooperLevelIcon from "@/components/icons/CooperLevelIcon.vue";
import { toKilometers, toMeters, evaluateCooper } from "@/services/cooper";
import { useProfileStore } from "@/composables/useProfileStore.js";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/vue/24/outline";
import ExerciseCell from "@/components/ui/ExerciseCell.vue";

const props = defineProps({
  tests: { type: Array, default: () => [] },
});

const { t } = useI18n();
const { profile } = useProfileStore();
const genderKey = profile.value?.gender?.toLowerCase() || "m";
const age = profile.value?.age || 0;

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
  <div class="mt-6">
    <div class="mb-3 flex items-center justify-between">
      <h2>{{ t('dashboard.table.title') }}</h2>
      <BaseButton
        type="button"
        variant="primary"
        class="flex items-center gap-1 px-3 py-1.5"
        @click="$emit('new')"
        aria-label="Create new test entry"
      >
        <PlusIcon class="size-6" />
        <span>{{ t('dashboard.table.newEntry') }}</span>
      </BaseButton>
    </div>
    <div class="overflow-x-auto shadow-lg rounded-lg">
    <table
      class="bg-white text-sm w-full"
    >
      <thead class="bg-gray-50">
        <tr>
          <th class="exercise__cell--title">{{ t('dashboard.table.headers.date') }}</th>
          <th class="exercise__cell--title">
            <span class="inline text-xs font-bold uppercase sm:hidden">{{ t('dashboard.table.headers.pullUpsShort') }}</span>
            <span class="hidden sm:inline" :title="t('dashboard.table.headers.pullUps')">{{ t('dashboard.table.headers.pullUps') }}</span>
          </th>
          <th class="exercise__cell--title">
            <span class="inline text-xs font-bold uppercase sm:hidden">{{ t('dashboard.table.headers.pushUpsShort') }}</span>
            <span class="hidden sm:inline" :title="t('dashboard.table.headers.pushUps')">{{ t('dashboard.table.headers.pushUps') }}</span>
          </th>
          <th class="exercise__cell--title">
            <span class="inline text-xs font-bold uppercase sm:hidden">{{ t('dashboard.table.headers.squatsShort') }}</span>
            <span class="hidden sm:inline" :title="t('dashboard.table.headers.squats')">{{ t('dashboard.table.headers.squats') }}</span>
          </th>
          <th class="exercise__cell--title">
            <span class="inline text-xs font-bold uppercase sm:hidden">{{ t('dashboard.table.headers.vUpsShort') }}</span>
            <span class="hidden sm:inline" :title="t('dashboard.table.headers.vUps')">{{ t('dashboard.table.headers.vUps') }}</span>
          </th>
          <th class="exercise__cell--title">
            <span class="inline text-xs font-bold uppercase sm:hidden">{{ t('dashboard.table.headers.burpeesShort') }}</span>
            <span class="hidden sm:inline" :title="t('dashboard.table.headers.burpees')">{{ t('dashboard.table.headers.burpees') }}</span>
          </th>
          <th class="exercise__cell--title">
            <span class="inline text-xs font-bold uppercase sm:hidden">{{ t('dashboard.table.headers.kmShort') }}</span>
            <span class="hidden sm:inline" :title="t('dashboard.table.headers.km')">{{ t('dashboard.table.headers.km') }}</span>
          </th>
          <th class="exercise__cell--title">
            <span class="inline text-xs font-bold uppercase sm:hidden">{{ t('dashboard.table.headers.actionsShort') }}</span>
            <span class="hidden sm:inline" :title="t('dashboard.table.headers.actions')">{{ t('dashboard.table.headers.actions') }}</span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(tr, i) in rows" :key="i">
          <td class="exercise__cell font-semibold">
            <span class="hidden sm:inline"
              >{{ formatPrettyDate(tr.date).year }}&nbsp;</span
            >{{ formatPrettyDate(tr.date).month }}
          </td>
          <ExerciseCell :value="tr.pullup?.reps" />
          <ExerciseCell :value="tr.pushup?.reps" />
          <ExerciseCell :value="tr.squats?.reps" />
          <ExerciseCell :value="tr.vups?.reps" />
          <ExerciseCell :value="tr.burpees?.reps" />
          <ExerciseCell :value="tr._cooperKm">
              <CooperLevelIcon
                :level="tr._cooperLevel"
                :showText="true"
                class="inline size-5 ml-1"
              />
          </ExerciseCell>
          <td class="exercise__cell">
            <div class="flex justify-center items-center">
            <button
              type="button"
              :data-menu-btn="tr._idx"
              class="icon-btn"
              @click="openMenu(tr._idx, $event)"
              aria-label="Actions"
            >
              <IconDotsVertical />
            </button>
            <Teleport to="body">
              <div
                v-if="menuState.openIndex === tr._idx"
                :data-menu-idx="tr._idx"
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
                      <PencilIcon class="size-5" />
                      <span>{{ t('dashboard.table.actions.edit') }}</span>
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
                      <TrashIcon class="size-5" />
                      <span>{{ t('dashboard.table.actions.delete') }}</span>
                    </button>
                  </li>
                </ul>
              </div>
            </Teleport>
            </div>
          </td>
        </tr>
        <tr v-if="rows.length === 0">
          <td colspan="8" class="px-3 py-4 text-center text-gray-500">
            {{ t('dashboard.table.noTests') }}
          </td>
        </tr>
      </tbody>
    </table>
    </div>
  </div>
</template>
