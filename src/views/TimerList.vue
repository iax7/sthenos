<template>
  <ViewContainer>
    <div class="min-h-screen bg-gray-50 py-8">
      <div class="max-w-4xl mx-auto px-4">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-4xl font-bold text-gray-900 mb-2">Exercise Timer</h1>
          <p class="text-gray-600">Choose a protocol to start your workout</p>
        </div>

        <!-- Protocols Grid -->
        <div class="grid gap-6 md:grid-cols-2">
          <div
            v-for="protocol in allProtocols"
            :key="protocol.id"
            class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 overflow-hidden flex flex-col"
            @click="startProtocol(protocol.id)"
          >
            <div class="p-5 flex-1">
              <div class="flex justify-between items-start mb-2">
                <h2 class="text-xl font-bold text-gray-900">
                  {{ protocol.name }}
                </h2>
                <span
                  v-if="protocol.isCustom"
                  class="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded"
                >
                  Custom
                </span>
              </div>

              <p class="text-gray-600 text-sm mb-4 line-clamp-2">
                {{ protocol.description }}
              </p>

              <div class="grid grid-cols-3 gap-3 text-sm mb-4">
                <div class="text-center">
                  <div class="text-2xl font-bold text-gray-900">{{ protocol.sets }}</div>
                  <div class="text-xs text-gray-500 mt-1">Sets</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-gray-900">{{ protocol.intervals.length }}</div>
                  <div class="text-xs text-gray-500 mt-1">Intervals</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-gray-900">{{ calculateTotalTime(protocol) }}</div>
                  <div class="text-xs text-gray-500 mt-1">Total time</div>
                </div>
              </div>

              <div class="pt-3 border-t border-gray-100">
                <div class="text-xs text-gray-500 space-y-1">
                  <div v-for="(interval, idx) in protocol.intervals" :key="idx">
                    • {{ interval.label }}: {{ formatDuration(interval.duration) }}
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-gray-50 px-5 py-3 border-t border-gray-200">
              <button class="text-green-600 hover:text-green-700 font-semibold text-sm w-full text-center">
                Start Workout →
              </button>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div
          v-if="allProtocols.length === 0"
          class="text-center py-12 bg-white rounded-lg shadow-md"
        >
          <div class="text-6xl mb-4">⏱️</div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">No protocols yet</h2>
          <p class="text-gray-600">Create your first custom protocol to get started</p>
        </div>

        <!-- Info section -->
        <div class="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 class="text-lg font-bold text-blue-900 mb-2">ℹ️ How it works</h3>
          <ul class="text-blue-800 text-sm space-y-1">
            <li>• Choose a protocol to start your workout timer</li>
            <li>• The timer will guide you through each interval with audio and visual cues</li>
            <li>• You can pause, resume, or reset the timer at any time</li>
            <li>• Colors indicate the current phase: 🟡 Prep, 🟢 Exercise, 🔵 Rest</li>
          </ul>
        </div>
      </div>
    </div>
  </ViewContainer>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useTimerProtocols } from '@/composables/useTimerProtocols'
import ViewContainer from '@/components/ui/ViewContainer.vue'

const router = useRouter()
const { allProtocols } = useTimerProtocols()

function startProtocol(id) {
  router.push(`/timer/${id}/run`)
}

function formatDuration(seconds) {
  if (seconds < 60) {
    return `${seconds}s`
  }
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`
}

function calculateTotalTime(protocol) {
  const intervalTime = protocol.intervals.reduce((sum, i) => sum + i.duration, 0)
  const totalTime = protocol.prepTime + (intervalTime * protocol.sets) + (protocol.restBetweenSets * (protocol.sets - 1))
  return formatDuration(totalTime)
}
</script>

