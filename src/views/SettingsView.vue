<script setup>
/**
 * Settings View - Profile backup/restore functionality
 *
 * DATA ENCODING STRATEGY:
 * - Online backups: Base64 encoded for light obfuscation
 *   → Prevents search engine indexing of sensitive data
 *   → See: encodeToBase64() and decodeFromBase64()
 *   → Current provider: dpaste.com (easy to migrate if needed)
 *
 * - Local file export/import: Plain JSON (human-readable)
 *   → Users can inspect and edit downloaded files
 *   → See: downloadProfile() and handleFileChange()
 *
 * DO NOT remove base64 encoding from online backups - it's intentional privacy protection.
 */
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useToasts } from '@/composables/useToasts.js'
import { useProfileStore } from '@/composables/useProfileStore.js'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppVersion from '@/components/AppVersion.vue'
import ViewContainer from '@/components/ui/ViewContainer.vue'
import {
  ArrowLeftIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  DocumentIcon,
  LinkIcon,
  CloudArrowUpIcon,
  ClipboardDocumentIcon,
  TrashIcon,
} from '@heroicons/vue/24/outline'

const buildTime = new Date(__BUILD_TIME__).toLocaleString('sv-SE', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
}).replace(',', '')
const router = useRouter()
const { t } = useI18n()
const {
  getProfileData,
  saveLastImportUrl,
  getLastImportUrl,
  clearLastImportUrl,
  importProfile,
  hasProfile,
  loadProfile,
} = useProfileStore()
const { pushToast } = useToasts()
const fileInput = ref(null)

const url = ref(getLastImportUrl() || '')
const uploading = ref(false)


/**
 * Encode string to base64 (UTF-8 safe).
 * Used for light obfuscation to prevent search engine indexing of sensitive data.
 * DO NOT REMOVE: This is intentional obfuscation, not security.
 *
 * @param {string} str - Plain text string to encode
 * @returns {string} Base64 encoded string
 */
function encodeToBase64(str) {
  try {
    // Modern approach: convert string to Uint8Array, then to base64
    const bytes = new TextEncoder().encode(str)
    const binString = Array.from(bytes, (byte) => String.fromCodePoint(byte)).join('')
    return btoa(binString)
  } catch {
    // Fallback: use simple btoa (may fail for non-latin1)
    return btoa(str)
  }
}

/**
 * Decode base64 string to plain text (UTF-8 safe).
 * Counterpart to encodeToBase64 for retrieving obfuscated data.
 * DO NOT REMOVE: Required to read base64-encoded backups.
 *
 * @param {string} base64Str - Base64 encoded string
 * @returns {string} Decoded plain text string
 */
function decodeFromBase64(base64Str) {
  try {
    // Modern approach: decode base64 to Uint8Array, then to string
    const binString = atob(base64Str)
    const bytes = Uint8Array.from(binString, (char) => char.charCodeAt(0))
    return new TextDecoder().decode(bytes)
  } catch {
    // Fallback to atob only
    return atob(base64Str)
  }
}

function goBack() {
  router.back()
}

/**
 * Upload profile backup to online paste service.
 */
async function backupOnline() {
  try {
    uploading.value = true
    const json = getProfileData()

    const encodedContent = encodeToBase64(json)

    // Online paste service API (currently: dpaste.com) - supports CORS natively
    const resp = await fetch('https://dpaste.com/api/v2/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Sthenos-App/1.0',
      },
      body: new URLSearchParams({
        content: encodedContent,
        syntax: 'text', // Changed from 'json' since content is base64
        expiry_days: '365',
      }),
    })

    if (!resp.ok) {
      pushToast(t('settings.uploadFailed') + ` ${resp.status} ${resp.statusText}`, 'error')
      return
    }

    const pasteUrl = (await resp.text()).trim()
    if (!pasteUrl) {
      pushToast(t('settings.uploadFailed'), 'error')
      return
    }

    url.value = pasteUrl
    try {
      saveLastImportUrl(pasteUrl)
    } catch {
      // ignore
    }
    pushToast(t('settings.uploadSuccess'), 'success')
  } catch (err) {
    pushToast(err.message || t('settings.uploadFailed'), 'error')
  } finally {
    uploading.value = false
  }
}

function saveUrl() {
  if (!url.value || !url.value.trim()) {
    pushToast(t('settings.noUrl'), 'error')
    return
  }
  saveLastImportUrl(url.value.trim())
  pushToast(t('settings.urlSaved'), 'success')
}

async function fetchFromUrl() {
  const rawUrl = (url.value || '').trim()
  if (!rawUrl) {
    pushToast(t('settings.noUrl'), 'error')
    return
  }

  try {
    // Convert dpaste.com URL to raw format if needed
    let fetchUrl = rawUrl
    try {
      const u = new URL(rawUrl)
      if (/dpaste\.com$/i.test(u.hostname)) {
        // Ensure we're fetching the raw text version
        if (!u.pathname.endsWith('.txt')) {
          const pasteId = u.pathname.split('/').filter(Boolean).pop()
          fetchUrl = `https://dpaste.com/${pasteId}.txt`
        }
      }
    } catch {
      // not a valid absolute URL — leave as-is, fetch may fail
    }

    const response = await fetch(fetchUrl)
    if (!response.ok) {
      pushToast(`${t('nav.importFailed')} (HTTP ${response.status})`, 'error')
      return
    }

    const text = await response.text()

    // Try to decode from base64 (obfuscated format), fallback to direct JSON
    let jsonString = text
    try {
      // First, try decoding from base64 (new format with obfuscation)
      jsonString = decodeFromBase64(text.trim())
    } catch {
      // If decode fails, assume it's plain JSON (legacy format or manual entry)
      jsonString = text
    }

    // Parse the JSON and import profile
    try {
      const parsed = JSON.parse(jsonString)
      const result = importProfile(parsed)
      if (result.ok) {
        saveLastImportUrl(rawUrl)
        // reload composable state and notify app so UI updates
        try {
          loadProfile()
        } catch (e) {
          void e
        }
        pushToast(t('nav.profileImported'), 'success')
        if (router.currentRoute.value.path === '/') {
          window.dispatchEvent(new CustomEvent('profile-updated'))
        } else {
          router.replace('/')
        }
      } else {
        pushToast(result.error || t('nav.importFailed'), 'error')
      }
    } catch {
      pushToast(t('nav.importFailed'), 'error')
    }
  } catch {
    pushToast(t('nav.importFailed'), 'error')
  }
}

function clearSaved() {
  clearLastImportUrl()
  url.value = ''
  pushToast(t('settings.urlCleared'), 'success')
}

async function copyUrl() {
  const urlText = (url.value || '').trim()
  if (!urlText) {
    pushToast(t('settings.noUrl'), 'error')
    return
  }
  try {
    await navigator.clipboard.writeText(urlText)
    pushToast(t('settings.urlCopied'), 'success')
  } catch {
    pushToast(t('settings.copyFailed'), 'error')
  }
}

/**
 * Download profile as plain JSON file (no encoding).
 * Local file exports use plain JSON for easy inspection/editing.
 * DO NOT apply base64 encoding here - users should see readable JSON.
 */
function downloadProfile() {
  const json = getProfileData()
  const blob = new Blob([json], { type: 'application/json' })
  const a = document.createElement('a')
  const date = new Date().toISOString().slice(0, 10)
  a.href = URL.createObjectURL(blob)
  a.download = `profile-${date}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(a.href)
  pushToast(t('nav.jsonDownloaded'), 'success')
}

function triggerUpload() {
  fileInput.value?.click()
}

/**
 * Handle local file upload (plain JSON).
 * Local file imports expect plain JSON (no base64 decoding).
 * DO NOT decode base64 here - local files are plain JSON.
 */
function handleFileChange(e) {
  const file = e.target.files && e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result)
      const result = importProfile(parsed)
      if (result.ok) {
        pushToast(t('nav.profileImported'), 'success')
        if (router.currentRoute.value.path === '/') {
          window.dispatchEvent(new CustomEvent('profile-updated'))
        } else {
          router.push('/')
        }
      } else {
        pushToast(result.error || t('nav.importFailed'), 'error')
      }
    } catch {
      pushToast(t('nav.invalidJson'), 'error')
    }
    e.target.value = ''
  }
  reader.readAsText(file)
}
</script>

<template>
  <ViewContainer>
    <div class="flex items-center justify-between">
      <h2>
        {{ t('settings.title') }}
      </h2>
      <BaseButton variant="secondary" type="button" @click="goBack">
        <ArrowLeftIcon class="size-5 mr-1" />
        {{ t('app.back') }}
      </BaseButton>
    </div>

    <AppCard>
      <h3 class="mb-2 text-xl font-semibold flex items-center gap-2">
        <CloudArrowUpIcon class="size-6 text-gray-600" />
        {{ t('settings.backupTitle') }}
      </h3>
      <p class="text-sm text-gray-600">{{ t('settings.description') }}</p>
      <p class="text-sm text-amber-600 mt-2 font-medium">{{ t('settings.expirationWarning') }}</p>

      <div class="mt-3 flex items-center">
        <BaseButton :disabled="!hasProfile" @click.prevent="backupOnline">
          <ArrowUpTrayIcon class="size-5 mr-1" />
          {{ uploading ? t('settings.uploading') : t('settings.backupButton') }}
        </BaseButton>
      </div>
    </AppCard>

    <AppCard>
      <div class="flex items-center justify-between">
        <h3 class="text-xl font-semibold flex items-center gap-2">
          <LinkIcon class="size-5 text-gray-600" />
          {{ t('settings.pasteUrl') }}
        </h3>
        <BaseButton variant="secondary" @click.prevent="clearSaved">
          <TrashIcon class="size-5 mr-1" />
          {{ t('settings.clearSaved') }}
        </BaseButton>
      </div>
      <div class="relative">
        <BaseInput v-model="url" type="text" placeholder="https://dpaste.com/XXXXX" class="pr-10" />
        <button
          v-if="url"
          type="button"
          class="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-blue-700 transition-colors"
          @click="copyUrl"
          :title="t('settings.copyUrl')"
        >
          <ClipboardDocumentIcon class="size-5" />
        </button>
      </div>
      <div class="flex gap-2">
        <BaseButton @click.prevent="saveUrl">{{ t('settings.saveUrl') }}</BaseButton>
        <BaseButton @click.prevent="fetchFromUrl">
          <ArrowDownTrayIcon class="size-5 mr-1" />
          {{ t('settings.fetchUrl') }}
        </BaseButton>
      </div>
    </AppCard>

    <AppCard class="p-4">
      <h3 class="mb-2 text-xl font-semibold flex items-center gap-2">
        <DocumentIcon class="size-5 text-gray-600" />
        {{ t('settings.fileActionsTitle') }}
      </h3>
      <p class="text-sm text-gray-600">{{ t('settings.fileActionsDescription') }}</p>
      <div class="flex items-center gap-2">
        <BaseButton :disabled="!hasProfile" @click.prevent="downloadProfile">
          <ArrowDownTrayIcon class="size-5 mr-1" />
          {{ t('nav.download') }}
        </BaseButton>
        <BaseButton variant="secondary" @click.prevent="triggerUpload">
          <ArrowUpTrayIcon class="size-5 mr-1" />
          {{ t('nav.upload') }}
        </BaseButton>
      </div>
      <input
        ref="fileInput"
        type="file"
        accept="application/json"
        class="hidden"
        @change="handleFileChange"
      />
    </AppCard>

    <AppVersion />

  </ViewContainer>
</template>
