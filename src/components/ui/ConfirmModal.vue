<script setup>
defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, required: true },
  message: { type: String, default: '' },
  confirmLabel: { type: String, default: 'Confirm' },
  confirmVariant: { type: String, default: 'danger' },
})

const emit = defineEmits(['update:open', 'confirm', 'cancel'])

function onCancel() {
  emit('update:open', false)
  emit('cancel')
}

function onConfirm() {
  emit('update:open', false)
  emit('confirm')
}
</script>

<template>
  <Teleport to="body">
    <Transition enter-active-class="transition-opacity duration-150" enter-from-class="opacity-0"
      enter-to-class="opacity-100" leave-active-class="transition-opacity duration-100" leave-from-class="opacity-100"
      leave-to-class="opacity-0">
      <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true"
        :aria-labelledby="title" @click.self="onCancel">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/40" @click="onCancel" />

        <!-- Panel -->
        <div class="relative z-10 w-full max-w-sm rounded-xl bg-white shadow-xl ring-1 ring-gray-900/10 p-6">
          <div class="flex items-start gap-4">
            <!-- Danger icon -->
            <div v-if="confirmVariant === 'danger'"
              class="shrink-0 flex items-center justify-center size-10 rounded-full bg-red-100">
              <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-red-600" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            </div>
            <!-- Question icon (primary / default) -->
            <div v-else class="shrink-0 flex items-center justify-center size-10 rounded-full bg-blue-100">
              <svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-blue-600" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
              </svg>
            </div>
            <div>
              <h3 class="text-base font-semibold text-gray-900">{{ title }}</h3>
              <p v-if="message" class="mt-1 text-sm text-gray-600">{{ message }}</p>
            </div>
          </div>
          <div class="mt-6 flex justify-end gap-3">
            <button type="button"
              class="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors focus:outline-none shadow-md"
              @click="onCancel">
              <slot name="cancel-label">Cancel</slot>
            </button>
            <button type="button"
              class="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none shadow-md"
              :class="{
                'bg-red-600 text-white hover:bg-red-700': confirmVariant === 'danger',
                'bg-blue-600 text-white hover:bg-blue-700': confirmVariant === 'primary',
              }" @click="onConfirm">
              {{ confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
