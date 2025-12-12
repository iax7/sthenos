import { createRouter, createWebHashHistory } from 'vue-router'
import ProfileView from '@/views/ProfileView.vue'
import HomeView from '@/views/HomeView.vue'
import ExerciseEdit from '@/views/ExerciseEdit.vue'
import ExerciseView from '@/views/ExerciseView.vue'
import SettingsView from '@/views/SettingsView.vue'
import InfoView from '@/views/InfoView.vue'
import TimerList from '@/views/TimerList.vue'
import TimerRunner from '@/views/TimerRunner.vue'
import { useProfileStore } from '@/composables/useProfileStore.js'

const routes = [
  { path: '/', name: 'dashboard', component: HomeView },
  { path: '/profile', name: 'profile', component: ProfileView },
  { path: '/settings', name: 'settings', component: SettingsView, meta: { noProfile: true } },
  { path: '/info', name: 'info', component: InfoView, meta: { noProfile: true } },
  { path: '/exercise/new', name: 'exercise-new', component: ExerciseEdit },
  { path: '/exercise/:index/edit', name: 'exercise-edit', component: ExerciseEdit, props: true },
  { path: '/exercise/:index', name: 'exercise-view', component: ExerciseView, props: true },
  { path: '/timer', name: 'timer-list', component: TimerList, meta: { noProfile: true } },
  { path: '/timer/:id/run', name: 'timer-run', component: TimerRunner, meta: { noProfile: true } },
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

// Simple guard: if no stored profile, redirect protected routes to profile form
router.beforeEach((to) => {
  try {
    const { profile } = useProfileStore()
    const hasProfile = !!profile.value && !!profile.value.name

    // Always allow navigating to the profile form itself
    if (to.name === 'profile') {
      return
    }

    // If route explicitly allows no profile via meta.noProfile, allow it
    if (to.meta && to.meta.noProfile === true) {
      return
    }

    // Otherwise, protect routes when no profile exists
    if (!hasProfile) {
      return { name: 'profile' }
    }
  } catch {
    return { name: 'profile' }
  }
})
