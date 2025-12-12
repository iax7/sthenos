import { ref, computed } from 'vue'
import { defaultProtocols } from '@/data/default-protocols.js'

const STORAGE_KEY = 'timer_protocols_v1'

// Reactive state
const customProtocols = ref([])

// Load from localStorage on initialization
function loadProtocols() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      customProtocols.value = JSON.parse(stored)
    }
  } catch (error) {
    console.error('Error loading protocols from localStorage:', error)
    customProtocols.value = []
  }
}

// Save to localStorage
function saveProtocols() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customProtocols.value))
  } catch (error) {
    console.error('Error saving protocols to localStorage:', error)
  }
}

/**
 * Composable for managing timer protocols
 */
export function useTimerProtocols() {
  // All protocols (default + custom)
  const allProtocols = computed(() => [
    ...defaultProtocols,
    ...customProtocols.value
  ])

  // Find protocol by ID
  function getProtocol(id) {
    return allProtocols.value.find(p => p.id === id)
  }

  // Add custom protocol
  function addProtocol(protocol) {
    const newProtocol = {
      ...protocol,
      id: `custom-${Date.now()}`,
      isCustom: true
    }
    customProtocols.value.push(newProtocol)
    saveProtocols()
    return newProtocol
  }

  // Update custom protocol
  function updateProtocol(id, updates) {
    const index = customProtocols.value.findIndex(p => p.id === id)
    if (index !== -1) {
      customProtocols.value[index] = { ...customProtocols.value[index], ...updates }
      saveProtocols()
      return true
    }
    return false
  }

  // Delete custom protocol
  function deleteProtocol(id) {
    const index = customProtocols.value.findIndex(p => p.id === id)
    if (index !== -1) {
      customProtocols.value.splice(index, 1)
      saveProtocols()
      return true
    }
    return false
  }

  // Export protocols as JSON
  function exportProtocols() {
    const data = JSON.stringify(customProtocols.value, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `timer-protocols-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  // Import protocols from JSON
  function importProtocols(jsonData) {
    try {
      const imported = JSON.parse(jsonData)
      if (!Array.isArray(imported)) {
        throw new Error('Invalid format: expected array')
      }
      customProtocols.value = imported.map(p => ({ ...p, isCustom: true }))
      saveProtocols()
      return true
    } catch (error) {
      console.error('Error importing protocols:', error)
      return false
    }
  }

  // Initialize
  loadProtocols()

  return {
    allProtocols,
    customProtocols,
    getProtocol,
    addProtocol,
    updateProtocol,
    deleteProtocol,
    exportProtocols,
    importProtocols
  }
}

