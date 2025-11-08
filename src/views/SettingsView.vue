<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useToasts } from '@/composables/useToasts.js'
import { useProfileStore } from '@/composables/useProfileStore.js'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import AppCard from '@/components/ui/AppCard.vue'
import ViewContainer from '@/components/ViewContainer.vue'
import { ArrowLeftIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, DocumentIcon, LinkIcon, CloudArrowUpIcon, InformationCircleIcon } from '@heroicons/vue/24/outline'
import {
  PULL_UP_VERSIONS,
  PUSH_UP_VERSIONS,
  SQUAT_VERSIONS,
  VUP_VERSIONS,
  BURPEE_VERSIONS,
} from '@/services/exerciseVersions.js'

const router = useRouter()
const { t } = useI18n()
const { getProfileData, saveLastImportUrl, getLastImportUrl, clearLastImportUrl, importProfile, hasProfile, loadProfile } = useProfileStore()
const { pushToast } = useToasts()
const fileInput = ref(null)

const url = ref(getLastImportUrl() || '')
const uploading = ref(false)

const exerciseVersions = [
  { title: 'dashboard.table.headers.pullUps', versions: PULL_UP_VERSIONS },
  { title: 'dashboard.table.headers.pushUps', versions: PUSH_UP_VERSIONS },
  { title: 'dashboard.table.headers.squats', versions: SQUAT_VERSIONS },
  { title: 'dashboard.table.headers.vUps', versions: VUP_VERSIONS },
  { title: 'dashboard.table.headers.burpees', versions: BURPEE_VERSIONS },
]

function goBack() {
  router.push('/')
}

async function backupToPasteRs() {
  try {
    uploading.value = true
    const json = getProfileData()
    // base64-encode UTF-8 safely in browser
    function toBase64Utf8(str) {
      try {
        return btoa(unescape(encodeURIComponent(str)))
      } catch {
        // Fallback: use simple btoa (may fail for non-latin1)
        return btoa(str)
      }
    }

    const b64 = toBase64Utf8(json)

    // Use public CORS proxy to reach paste.rs from the browser
    const proxyUrl = 'https://corsproxy.io/?https://paste.rs'
    const resp = await fetch(proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: b64,
    })

    if (!resp.ok) {
      const text = await resp.text().catch(() => '')
      pushToast(t('settings.uploadFailed') + ` ${resp.status} ${resp.statusText} ${text}`, 'error')
      return
    }

    let pasteUrl = (await resp.text()).trim()
    if (!pasteUrl) {
      pushToast(t('settings.uploadFailed'), 'error')
      return
    }

    // Normalize id/path to full URL
    if (!/^https?:\/\//i.test(pasteUrl)) {
      if (/^[a-zA-Z0-9_-]+$/.test(pasteUrl)) {
        pasteUrl = `https://paste.rs/${pasteUrl}`
      } else if (pasteUrl.startsWith('/')) {
        pasteUrl = `https://paste.rs${pasteUrl}`
      }
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
    // If the url targets paste.rs, fetch it through the public CORS proxy
    let fetchUrl = rawUrl
    try {
      const u = new URL(rawUrl)
      if (/paste\.rs$/i.test(u.hostname) || /(^|\.)paste\.rs$/i.test(u.hostname)) {
        fetchUrl = `https://corsproxy.io/?${rawUrl}`
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

    // Try parse JSON directly
    try {
      const parsed = JSON.parse(text)
      const result = importProfile(parsed)
      if (result.ok) {
        saveLastImportUrl(rawUrl)
        // reload composable state and notify app so UI updates
        try { loadProfile() } catch (e) { void e }
        pushToast(t('nav.profileImported'), 'success')
        if (router.currentRoute.value.path === '/') {
          window.dispatchEvent(new CustomEvent('profile-updated'))
        } else {
          router.push('/')
        }
      } else {
        pushToast(result.error || t('nav.importFailed'), 'error')
      }
      return
    } catch {
      // not direct JSON, continue
    }

    // Try base64 decode -> JSON
    try {
      // remove whitespace/newlines
      const candidate = text.trim()
      let decoded = ''
      try {
        decoded = decodeURIComponent(escape(atob(candidate)))
      } catch {
        // fallback to atob only
        decoded = atob(candidate)
      }
      const parsed = JSON.parse(decoded)
      const result = importProfile(parsed)
      if (result.ok) {
        saveLastImportUrl(rawUrl)
        try { loadProfile() } catch (e) { void e }
        pushToast(t('nav.profileImported'), 'success')
        if (router.currentRoute.value.path === '/') {
          window.dispatchEvent(new CustomEvent('profile-updated'))
        } else {
          router.push('/')
        }
      } else {
        pushToast(result.error || t('nav.importFailed'), 'error')
      }
      return
    } catch {
      pushToast(t('nav.importFailed'), 'error')
      return
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
        <BaseButton :disabled="!hasProfile" @click.prevent="backupToPasteRs">
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
        <BaseButton variant="secondary" @click.prevent="clearSaved">{{ t('settings.clearSaved') }}</BaseButton>
      </div>
      <BaseInput
        v-model="url"
        type="text"
        placeholder="https://paste.rs/xxxx"
      />
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
      <input ref="fileInput" type="file" accept="application/json" class="hidden" @change="handleFileChange" />
    </AppCard>

    <AppCard>
      <h3 class="mb-4 text-xl font-semibold flex items-center gap-2">
        <InformationCircleIcon class="size-6 text-gray-600" />
        {{ t('settings.exerciseVersions') }}
      </h3>
      <p class="mb-4 text-sm text-gray-600">{{ t('settings.exerciseVersionsDescription') }}</p>

      <div class="space-y-4">
        <div v-for="exercise in exerciseVersions" :key="exercise.title" class="border-l-4 border-blue-500 pl-4">
          <h4 class="mb-2 font-semibold text-gray-800">{{ t(exercise.title) }}</h4>
          <ul class="space-y-1">
            <li v-for="version in exercise.versions" :key="version.value" class="text-sm text-gray-700">
              <span class="font-mono">{{ t(version.labelKey) }}</span>
              <span class="ml-2 font-semibold text-blue-600">{{ version.multiplier }}x</span>
            </li>
          </ul>
        </div>
      </div>
    </AppCard>
  </ViewContainer>
</template>
