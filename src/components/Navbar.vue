<script setup>
import { ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToasts } from '../composables/useToasts.js'
import { getProfileData, importProfile, clearProfile } from '../services/profileStore.js'
import IconMenu from './icons/IconMenu.vue'
import { ArrowUpTrayIcon, ArrowDownTrayIcon, TrashIcon } from '@heroicons/vue/24/outline'

const emit = defineEmits(['clear', 'imported'])

const menuOpen = ref(false)
const fileInput = ref(null)
const router = useRouter()
const { pushToast } = useToasts()

function toggleMenu() { menuOpen.value = !menuOpen.value }

function downloadProfile() {
  const json = getProfileData()
  const blob = new Blob([json], { type: 'application/json' })
  const a = document.createElement('a')
  const date = new Date().toISOString().slice(0,10)
  a.href = URL.createObjectURL(blob)
  a.download = `profile-${date}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(a.href)
  menuOpen.value = false
  pushToast('JSON downloaded', 'success')
}

function triggerUpload() { fileInput.value?.click() }

function handleFileChange(e) {
  const file = e.target.files && e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result)
      const result = importProfile(parsed)
      if (result.ok) {
        emit('imported', result.profile)
        pushToast('Profile imported', 'success')
        if (router.currentRoute.value.path === '/') {
          window.dispatchEvent(new CustomEvent('profile-updated'))
        } else {
          router.push('/')
        }
      } else {
        emit('imported', { error: result.error })
        pushToast(result.error || 'Import failed', 'error')
      }
    } catch (err) {
      emit('imported', { error: 'Invalid JSON file' })
      pushToast('Invalid JSON file', 'error')
    }
    e.target.value = ''
    menuOpen.value = false
  }
  reader.readAsText(file)
}

function confirmClear() {
  if (window.confirm('Clear all local profile data?')) {
    clearProfile()
    emit('clear')
    menuOpen.value = false
    pushToast('Local data cleared', 'success')
    router.push('/profile')
  }
}

function closeOnOutside(e) {
  if (!menuOpen.value) return
  const menuEl = document.getElementById('global-menu-dropdown')
  const btnEl = document.getElementById('global-menu-button')
  if (menuEl && !menuEl.contains(e.target) && btnEl && !btnEl.contains(e.target)) {
    menuOpen.value = false
  }
}
document.addEventListener('click', closeOnOutside)
onUnmounted(() => document.removeEventListener('click', closeOnOutside))
</script>

<template>
  <nav class="w-full bg-white/90 backdrop-blur border-b border-gray-200 sticky top-0 z-40">
    <div class="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
      <h1 class="font-bold tracking-wide text-2xl">Performance Tests</h1>
      <div class="relative">
        <button id="global-menu-button" type="button" class="icon-btn" @click="toggleMenu" aria-haspopup="true" :aria-expanded="menuOpen" title="Menu">
          <span class="sr-only">Open menu</span>
          <IconMenu />
        </button>
        <div v-if="menuOpen" id="global-menu-dropdown" class="absolute right-0 w-44 rounded-md border border-gray-200 bg-white shadow-sm z-50">
          <ul class="py-1 text-sm">
            <li>
              <button type="button" class="w-full flex items-center gap-2 text-left px-3 py-2 hover:bg-gray-100" @click="downloadProfile">
                 <ArrowDownTrayIcon class="w-5 h-5" />
                <span>Download data</span>
              </button>
            </li>
            <li>
              <button type="button" class="w-full flex items-center gap-2 text-left px-3 py-2 hover:bg-gray-100" @click="triggerUpload">
                 <ArrowUpTrayIcon class="w-5 h-5" />
                <span>Upload data</span>
              </button>
            </li>
            <hr class="my-1 border-gray-200" />
            <li>
              <button type="button" class="w-full flex items-center gap-2 text-left px-3 py-2 hover:bg-red-100 text-red-600" @click="confirmClear">
                 <TrashIcon class="w-5 h-5" />
                <span>Clear all data</span>
              </button>
            </li>
          </ul>
        </div>
        <input ref="fileInput" type="file" accept="application/json" class="hidden" @change="handleFileChange" />
      </div>
    </div>
  </nav>
</template>
