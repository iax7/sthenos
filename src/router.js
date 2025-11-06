import { createRouter, createWebHashHistory } from 'vue-router'
import ProfileView from '@/views/ProfileView.vue'
import HomeView from '@/views/HomeView.vue'
import ExerciseView from '@/views/ExerciseView.vue'
import { useProfileStore } from '@/composables/useProfileStore.js'

const routes = [
  { path: '/', name: 'dashboard', component: HomeView },
  { path: '/profile', name: 'profile', component: ProfileView },
  {
    path: '/exercise/new',
    name: 'exercise-new',
    component: ExerciseView,
    meta: { standalone: true },
  },
  {
    path: '/exercise/edit/:index',
    name: 'exercise-edit',
    component: ExerciseView,
    props: true,
    meta: { standalone: true },
  },
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
    // Dashboard now at '/'; protect dashboard and exercise routes when no profile
    const protectedNames = ['dashboard', 'exercise-new', 'exercise-edit']
    if (!hasProfile && protectedNames.includes(to.name)) {
      return { name: 'profile' }
    }
    // If profile exists and user navigates to profile form, allow editing.
  } catch (e) {
    return { name: 'profile' }
  }
})
