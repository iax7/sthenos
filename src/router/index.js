import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import { useProfileStore } from '@/stores/useProfileStore.js'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/tests', name: 'tests', component: () => import('@/views/TestsView.vue') },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: { noProfile: true },
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/views/SettingsView.vue'),
    meta: { noProfile: true },
  },
  {
    path: '/info',
    name: 'info',
    component: () => import('@/views/InfoView.vue'),
    meta: { noProfile: true },
  },
  { path: '/exercise/new', name: 'exercise-new', component: () => import('@/views/ExerciseEdit.vue') },
  {
    path: '/exercise/:index/edit',
    name: 'exercise-edit',
    component: () => import('@/views/ExerciseEdit.vue'),
    props: true,
  },
  {
    path: '/exercise/:index',
    name: 'exercise-view',
    component: () => import('@/views/ExerciseView.vue'),
    props: true,
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

// Simple guard: if no stored profile, redirect protected routes to profile form
router.beforeEach((to) => {
  try {
    const { profile } = useProfileStore()
    const hasProfile = !!profile.value && !!profile.value.name

    if (to.meta.noProfile || hasProfile) {
      return
    }

    return { name: 'profile' }
  } catch {
    return { name: 'profile' }
  }
})

export default router
