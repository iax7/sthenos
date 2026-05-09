<script setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import BaseButton from "@/components/ui/BaseButton.vue";
import { toMeters, evaluateCooper } from "@/services/cooper";
import { useProfileStore } from "@/composables/useProfileStore.js";
import { ageAtDate } from "@/composables/useProfileStore.js";
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, ChevronRightIcon } from "@heroicons/vue/24/outline";
import { calculateTotalScore } from "../services/exercises";

const props = defineProps({
  tests: { type: Array, default: () => [] },
});

const { t } = useI18n();
const { profile } = useProfileStore();
const genderKey = profile.value?.gender?.toLowerCase() || "m";

function parseDateParts(dateStr) {
  if (!dateStr) return { year: '', month: '', day: '' };
  const [y, m, d] = dateStr.split("-");
  // Use numeric constructor to avoid UTC-to-local timezone shift
  const date = new Date(Number(y), Number(m) - 1, Number(d || 1));
  if (isNaN(date.getTime())) return { year: y, month: dateStr, day: '' };
  const locale = navigator?.language || "en";
  const month = date.toLocaleDateString(locale, { month: "long" });
  return { year: y, month, day: d && d !== '01' ? String(parseInt(d, 10)) : '' };
}

const groupedByYear = computed(() => {
  const mapped = props.tests.slice().map((r, idx) => {
    const meters = toMeters(r.cooper || 0);
    const age = ageAtDate(profile.value?.dob, r.date);
    const level = evaluateCooper(meters, age, genderKey);
    const totalScore = calculateTotalScore(r, level);
    const parts = parseDateParts(r.date);
    return { ...r, _score: totalScore, _idx: idx, _parts: parts };
  });

  // Group keeping original order, new year label before first entry of each year
  const groups = [];
  let lastYear = null;
  for (const row of mapped) {
    if (row._parts.year !== lastYear) {
      groups.push({ type: 'year', year: row._parts.year });
      lastYear = row._parts.year;
    }
    groups.push({ type: 'row', data: row });
  }
  return groups;
});
</script>

<template>
  <div class="mt-6">
    <div class="mb-3 flex items-center justify-between">
      <h2>{{ t('dashboard.table.title') }}</h2>
      <BaseButton type="button" variant="primary" class="flex items-center gap-1 px-3 py-1.5" @click="$emit('new')"
        aria-label="Create new test entry">
        <PlusIcon class="size-6" />
        <span>{{ t('dashboard.table.newEntry') }}</span>
      </BaseButton>
    </div>

    <div class="bg-white rounded-lg shadow-lg overflow-hidden divide-y divide-gray-100">
      <div v-if="groupedByYear.length === 0" class="px-4 py-8 text-center text-gray-400">
        {{ t('dashboard.table.noTests') }}
      </div>

      <template v-for="(item, i) in groupedByYear" :key="i">
        <!-- Year separator -->
        <div v-if="item.type === 'year'"
          class="px-4 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 text-center">
          {{ item.year }}
        </div>

        <!-- Entry row -->
        <div v-else class="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
          @click="$emit('view', item.data._idx)">
          <!-- Date -->
          <div class="flex-1 min-w-0">
            <div class="font-semibold text-gray-800 capitalize leading-tight">
              {{ item.data._parts.month
              }}<span v-if="item.data._parts.day" class="ml-1 text-sm font-normal text-gray-400">{{ item.data._parts.day
              }}</span>
            </div>
          </div>

          <!-- Score -->
          <div class="flex items-baseline gap-1 font-bold text-blue-600 text-xl tabular-nums shrink-0">
            {{ item.data._score }}<span class="text-sm font-medium text-blue-400 ml-0.5">pts</span>
          </div>

          <div class="w-px h-6 bg-gray-200 shrink-0"></div>

          <!-- Actions -->
          <div class="flex items-center gap-1 shrink-0" @click.stop>
            <BaseButton variant="icon" :aria-label="t('dashboard.table.actions.edit')"
              @click="$emit('edit', item.data._idx)">
              <PencilIcon class="size-5" />
            </BaseButton>
            <BaseButton variant="icon" class="text-red-400 hover:text-red-600 hover:bg-red-50"
              :aria-label="t('dashboard.table.actions.delete')"
              @click="$emit('delete', { idx: item.data._idx, score: item.data._score, date: item.data.date, parts: item.data._parts })">
              <TrashIcon class="size-5" />
            </BaseButton>
          </div>

          <ChevronRightIcon class="size-4 text-gray-400 shrink-0" />
        </div>
      </template>
    </div>
  </div>
</template>
