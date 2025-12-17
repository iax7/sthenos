import { ref, computed, onUnmounted } from 'vue'

const TIMER_STATES = {
  IDLE: 'idle',
  PREP: 'prep',
  INTERVAL: 'interval',
  REST: 'rest',
  COMPLETED: 'completed'
}

/**
 * Composable for exercise timer engine
 */
export function useTimerEngine(protocol) {
  // State
  const state = ref(TIMER_STATES.IDLE)
  const currentSet = ref(1)
  const currentIntervalIndex = ref(0)
  const timeRemaining = ref(0)
  const isPaused = ref(false)
  const isRunning = ref(false)

  let intervalId = null
  let audioContext = null
  let wakeLock = null

  // Computed
  const totalSets = computed(() => protocol.sets)

  const currentInterval = computed(() => {
    if (state.value === TIMER_STATES.IDLE) {
      return { label: '', duration: 0 }
    }
    if (state.value === TIMER_STATES.PREP) {
      return { label: 'Get ready!', duration: protocol.prepTime }
    }
    if (state.value === TIMER_STATES.REST) {
      return { label: 'Rest', duration: protocol.restBetweenSets }
    }
    if (state.value === TIMER_STATES.COMPLETED) {
      return { label: 'Completed!', duration: 0 }
    }
    return protocol.intervals[currentIntervalIndex.value] || protocol.intervals[0]
  })

  const totalTimeRemaining = computed(() => {
    let total = 0

    // Time in current phase
    total += timeRemaining.value

    // If currently in interval, add rest after it (unless it's the last interval of the last set)
    if (state.value === TIMER_STATES.INTERVAL) {
      const isLastIntervalOfLastSet =
        currentSet.value === totalSets.value &&
        currentIntervalIndex.value === protocol.intervals.length - 1
      if (!isLastIntervalOfLastSet) {
        total += protocol.restBetweenSets
      }
    }

    // Remaining intervals in current set
    for (let i = currentIntervalIndex.value + 1; i < protocol.intervals.length; i++) {
      total += protocol.intervals[i].duration
      // Add rest after each interval except the last one of the last set
      const isLastInterval = i === protocol.intervals.length - 1
      const isLastSet = currentSet.value === totalSets.value
      if (!(isLastInterval && isLastSet)) {
        total += protocol.restBetweenSets
      }
    }

    // Remaining sets
    const remainingSets = totalSets.value - currentSet.value
    if (remainingSets > 0) {
      const setDuration = protocol.intervals.reduce((sum, interval) => sum + interval.duration, 0)
      // Each set has rest after each interval (intervals.length times per set)
      const restPerSet = protocol.restBetweenSets * protocol.intervals.length
      total += remainingSets * (setDuration + restPerSet)
    }

    return total
  })

  const progress = computed(() => {
    if (!currentInterval.value.duration) return 0
    return timeRemaining.value / currentInterval.value.duration
  })

  // Audio feedback
  function playBeep(frequency = 800, duration = 200) {
    try {
      if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)()
      }

      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = frequency
      oscillator.type = 'sine'

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + duration / 1000)
    } catch (error) {
      console.warn('Audio not supported:', error)
    }
  }

  function vibrate(pattern = 200) {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern)
    }
  }

  // Wake Lock to prevent screen from sleeping
  async function requestWakeLock() {
    try {
      if ('wakeLock' in navigator) {
        wakeLock = await navigator.wakeLock.request('screen')
        console.log('Wake Lock activated')

        // Re-request wake lock if it's released (e.g., tab becomes inactive)
        wakeLock.addEventListener('release', () => {
          console.log('Wake Lock released')
        })
      }
    } catch (error) {
      console.warn('Wake Lock not supported or failed:', error)
    }
  }

  async function releaseWakeLock() {
    try {
      if (wakeLock !== null) {
        await wakeLock.release()
        wakeLock = null
        console.log('Wake Lock released manually')
      }
    } catch (error) {
      console.warn('Failed to release Wake Lock:', error)
    }
  }

  // Timer control
  function tick() {
    if (isPaused.value || !isRunning.value) return

    timeRemaining.value--

    if (timeRemaining.value <= 0) {
      handlePhaseComplete()
    }
  }

  function handlePhaseComplete() {
    playBeep(1000, 300)
    vibrate([200, 100, 200])

    if (state.value === TIMER_STATES.PREP) {
      // Prep complete, start first interval
      state.value = TIMER_STATES.INTERVAL
      currentIntervalIndex.value = 0
      timeRemaining.value = protocol.intervals[0].duration
    } else if (state.value === TIMER_STATES.INTERVAL) {
      // Interval complete
      currentIntervalIndex.value++

      if (currentIntervalIndex.value >= protocol.intervals.length) {
        // All intervals in set complete
        if (currentSet.value >= totalSets.value) {
          // All sets complete
          complete()
        } else {
          // Move to next set, apply rest
          currentSet.value++
          currentIntervalIndex.value = 0
          state.value = TIMER_STATES.REST
          timeRemaining.value = protocol.restBetweenSets
        }
      } else {
        // More intervals in current set, apply rest before next interval
        state.value = TIMER_STATES.REST
        timeRemaining.value = protocol.restBetweenSets
      }
    } else if (state.value === TIMER_STATES.REST) {
      // Rest complete, start next interval
      state.value = TIMER_STATES.INTERVAL
      timeRemaining.value = protocol.intervals[currentIntervalIndex.value].duration
    }
  }

  function start() {
    if (state.value === TIMER_STATES.IDLE) {
      state.value = TIMER_STATES.PREP
      timeRemaining.value = protocol.prepTime
      currentSet.value = 1
      currentIntervalIndex.value = 0
    }

    isRunning.value = true
    isPaused.value = false

    if (intervalId) {
      clearInterval(intervalId)
    }

    intervalId = setInterval(tick, 1000)

    // Request wake lock to keep screen on
    requestWakeLock()
  }

  function pause() {
    isPaused.value = true
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  function resume() {
    isPaused.value = false
    if (!intervalId) {
      intervalId = setInterval(tick, 1000)
    }
  }

  function togglePause() {
    if (isPaused.value) {
      resume()
    } else {
      pause()
    }
  }

  function reset() {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
    state.value = TIMER_STATES.IDLE
    currentSet.value = 1
    currentIntervalIndex.value = 0
    timeRemaining.value = 0
    isPaused.value = false
    isRunning.value = false

    // Release wake lock when timer is reset
    releaseWakeLock()
  }

  function complete() {
    state.value = TIMER_STATES.COMPLETED
    timeRemaining.value = 0
    isRunning.value = false
    playBeep(1200, 500)
    vibrate([300, 100, 300, 100, 300])

    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }

    // Release wake lock when timer completes
    releaseWakeLock()
  }

  // Cleanup
  onUnmounted(() => {
    if (intervalId) {
      clearInterval(intervalId)
    }
    if (audioContext) {
      audioContext.close()
    }
    // Release wake lock on cleanup
    releaseWakeLock()
  })

  return {
    // State
    state,
    currentSet,
    currentIntervalIndex,
    timeRemaining,
    isPaused,
    isRunning,

    // Computed
    totalSets,
    currentInterval,
    totalTimeRemaining,
    progress,

    // Methods
    start,
    togglePause,
    reset,

    // Constants
    TIMER_STATES
  }
}

