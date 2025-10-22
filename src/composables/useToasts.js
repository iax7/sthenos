import { ref } from "vue";

// Global reactive toast list
const toasts = ref([]);
let nextId = 0;

function pushToast(message, variant = "success", ttl = 3000) {
  const id = ++nextId;
  const toast = { id, message, variant };
  toasts.value.push(toast);
  if (ttl) {
    setTimeout(() => removeToast(id), ttl);
  }
}

function removeToast(id) {
  toasts.value = toasts.value.filter((t) => t.id !== id);
}

export function useToasts() {
  return { toasts, pushToast, removeToast };
}

// Optional helper for error handling
export function toastError(err, fallback = "Unexpected error") {
  const msg = err && err.message ? err.message : fallback;
  pushToast(msg, "error", 5000);
}
