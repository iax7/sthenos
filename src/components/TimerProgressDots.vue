<template>
  <div class="flex flex-col items-center">
    <div v-if="dots.length > maxDots" class="text-sm text-gray-600 font-medium">
      Set {{ currentSet }} / {{ totalSets }}
    </div>
    <div v-else class="flex gap-3 mt-1">
      <span
        v-for="(dot, idx) in dots"
        :key="idx"
        :class="[
          'w-4 h-4 rounded-full transition-all duration-300 ease-in-out',
          dot === 'completed' ? 'bg-green-500 scale-100' : '',
          dot === 'pending' ? 'bg-gray-300 scale-90' : '',
          dot === 'current' && isRunning ? 'bg-gray-600 scale-110 animate-breath' : '',
          dot === 'current' && !isRunning ? 'bg-gray-400 scale-100' : ''
        ]"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentSet: { type: Number, required: true },
  totalSets: { type: Number, required: true },
  maxDots: { type: Number, default: 12 },
  isRunning: { type: Boolean, default: false }
})

const dots = computed(() => {
  if (props.totalSets > props.maxDots) return []
  const arr = []
  for (let i = 1; i <= props.totalSets; i++) {
    if (i < props.currentSet) arr.push('completed')
    else if (i === props.currentSet) arr.push('current')
    else arr.push('pending')
  }
  return arr
})
</script>

<style scoped>
@keyframes breath {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(75, 85, 99, 0.6);
    transform: scale(1.1);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(75, 85, 99, 0.1);
    transform: scale(1.2);
  }
}
.animate-breath {
  animation: breath 1.8s ease-in-out infinite;
}
</style>

