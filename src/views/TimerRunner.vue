<template>
  <ViewContainer>
    <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div class="max-w-2xl mx-auto px-4">
        <!-- Header -->
        <div class="mb-8">
          <button
            @click="router.push('/timer')"
            class="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2"
          >
            ← Back to protocols
          </button>
          <h1 class="text-3xl font-bold text-gray-900">{{ protocol.name }}</h1>
          <p class="text-gray-600 mt-1">{{ protocol.description }}</p>
        </div>

        <!-- Timer Display -->
        <div class="flex flex-col items-center mb-8">
          <TimerCircle
            :current-time="timeRemaining"
            :total-time="currentInterval.duration"
            :label="currentInterval.label"
            :progress-color="stateColor"
            :size="320"
          />

          <!-- Set Progress Dots (only if <= 12 sets) -->
          <div v-if="totalSets <= 12" class="mt-6">
            <TimerProgressDots
              :current-set="currentSet"
              :total-sets="totalSets"
              :max-dots="12"
              :is-running="
                !isPaused && state !== TIMER_STATES.IDLE && state !== TIMER_STATES.COMPLETED
              "
              :is-completed="state === TIMER_STATES.COMPLETED"
            />
          </div>
        </div>

        <!-- State info -->
        <div class="bg-white rounded-lg shadow-md p-6 mb-6">
          <div class="grid grid-cols-2 gap-4 text-center">
            <div class="flex flex-col items-center gap-2">
              <div class="text-3xl font-bold text-gray-900">
                {{ currentSet }}
              </div>
              <span class="text-sm text-gray-600">Current Set</span>
            </div>
            <div class="flex flex-col items-center gap-2">
              <div class="text-3xl font-bold text-gray-900">
                {{ totalSets }}
              </div>
              <span class="text-sm text-gray-600">Total Sets</span>
            </div>
          </div>

          <div class="mt-4 pt-4 border-t border-gray-200">
            <div class="flex flex-col items-center gap-2">
              <span class="text-sm text-gray-600">Total time remaining</span>
              <span class="text-3xl font-bold tabular-nums text-gray-900">{{ formatTime(totalTimeRemaining) }}</span>
            </div>
          </div>
        </div>

        <!-- Controls -->
        <div class="flex gap-4 justify-center">
          <BaseButton
            v-if="state === TIMER_STATES.IDLE || state === TIMER_STATES.COMPLETED"
            @click="start"
            class="px-8 py-4 text-lg"
          >
            {{ state === TIMER_STATES.COMPLETED ? 'Restart' : 'Start' }}
          </BaseButton>

          <template v-else>
            <BaseButton @click="togglePause" variant="primary" class="px-8 py-4 text-lg">
              {{ isPaused ? '▶ Resume' : '⏸ Pause' }}
            </BaseButton>

            <BaseButton @click="handleReset" variant="secondary" class="px-8 py-4 text-lg">
              Reset
            </BaseButton>
          </template>
        </div>

        <!-- Completion message -->
        <div
          v-if="state === TIMER_STATES.COMPLETED"
          class="mt-8 bg-green-50 border border-green-200 rounded-lg p-6 text-center"
        >
          <div class="text-4xl mb-2">🎉</div>
          <h2 class="text-2xl font-bold text-green-900 mb-2">Workout Complete!</h2>
          <p class="text-green-700">Great job finishing all {{ totalSets }} sets!</p>
        </div>
      </div>
    </div>
  </ViewContainer>
</template>

<script setup>
import { computed, onBeforeUnmount, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTimerProtocols } from '@/composables/useTimerProtocols'
import { useTimerEngine } from '@/composables/useTimerEngine'
import TimerCircle from '@/components/TimerCircle.vue'
import TimerProgressDots from '@/components/TimerProgressDots.vue'
import ViewContainer from '@/components/ui/ViewContainer.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import confetti from 'canvas-confetti'

const router = useRouter()
const route = useRoute()
const { getProtocol } = useTimerProtocols()

// Get protocol from route
const protocol = getProtocol(route.params.id)

if (!protocol) {
  router.push('/timer')
  throw new Error('Protocol not found')
}

// Initialize timer engine
const {
  state,
  currentSet,
  timeRemaining,
  isPaused,
  totalSets,
  currentInterval,
  totalTimeRemaining,
  start,
  togglePause,
  reset,
  TIMER_STATES,
} = useTimerEngine(protocol)

// State color
const stateColor = computed(() => {
  const colors = {
    prep: '#f59e0b',
    interval: '#10b981',
    rest: '#3b82f6',
    completed: '#10b981',
  }
  return colors[state.value] || '#10b981'
})

// Audio context for sound effects
const audioContext = new (window.AudioContext || window.webkitAudioContext)()

// Play countdown beep (for last 3 seconds)
function playCountdownBeep() {
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.frequency.value = 800 // Higher pitch
  oscillator.type = 'sine'

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)

  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + 0.1)
}

// Play completion sound (celebratory)
function playCompletionSound() {
  // First tone
  const osc1 = audioContext.createOscillator()
  const gain1 = audioContext.createGain()
  osc1.connect(gain1)
  gain1.connect(audioContext.destination)
  osc1.frequency.value = 523.25 // C5
  osc1.type = 'sine'
  gain1.gain.setValueAtTime(0.3, audioContext.currentTime)
  gain1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
  osc1.start(audioContext.currentTime)
  osc1.stop(audioContext.currentTime + 0.3)

  // Second tone
  const osc2 = audioContext.createOscillator()
  const gain2 = audioContext.createGain()
  osc2.connect(gain2)
  gain2.connect(audioContext.destination)
  osc2.frequency.value = 659.25 // E5
  osc2.type = 'sine'
  gain2.gain.setValueAtTime(0.3, audioContext.currentTime + 0.15)
  gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.45)
  osc2.start(audioContext.currentTime + 0.15)
  osc2.stop(audioContext.currentTime + 0.45)

  // Third tone
  const osc3 = audioContext.createOscillator()
  const gain3 = audioContext.createGain()
  osc3.connect(gain3)
  gain3.connect(audioContext.destination)
  osc3.frequency.value = 783.99 // G5
  osc3.type = 'sine'
  gain3.gain.setValueAtTime(0.3, audioContext.currentTime + 0.3)
  gain3.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6)
  osc3.start(audioContext.currentTime + 0.3)
  osc3.stop(audioContext.currentTime + 0.6)
}

// Watch for countdown beeps (last 3 seconds)
watch(timeRemaining, (newTime) => {
  if (newTime <= 3 && newTime > 0 && !isPaused.value && state.value !== TIMER_STATES.IDLE) {
    playCountdownBeep()
  }
})

// Confetti effect and completion sound when workout completes
watch(state, (newState, oldState) => {
  if (newState === TIMER_STATES.COMPLETED && oldState !== TIMER_STATES.COMPLETED) {
    playCompletionSound()
    triggerConfetti()
  }
})

function triggerConfetti() {
  const duration = 3000
  const end = Date.now() + duration

  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444']

  ;(function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: colors,
    })
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colors,
    })

    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  })()
}

// Format time helper
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Confirm reset
function handleReset() {
  if (confirm('Are you sure you want to reset the timer?')) {
    reset()
  }
}

// Prevent accidental navigation
onBeforeUnmount(() => {
  if (state.value !== TIMER_STATES.IDLE && state.value !== TIMER_STATES.COMPLETED) {
    const leave = confirm('Timer is still running. Are you sure you want to leave?')
    if (!leave) {
      return false
    }
  }
})
</script>
