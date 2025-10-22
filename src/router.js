import { createRouter, createWebHashHistory } from "vue-router";
import ProfileForm from "./components/ProfileForm.vue";
import Dashboard from "./components/Dashboard.vue";
import ExerciseEditor from "./components/ExerciseEditor.vue";

const routes = [
  { path: "/", name: "dashboard", component: Dashboard },
  { path: "/profile", name: "profile", component: ProfileForm },
  { path: "/dashboard", redirect: "/" },
  {
    path: "/exercise/new",
    name: "exercise-new",
    component: ExerciseEditor,
    meta: { standalone: true },
  },
  {
    path: "/exercise/edit/:index",
    name: "exercise-edit",
    component: ExerciseEditor,
    props: true,
    meta: { standalone: true },
  },
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

// Simple guard: if no stored profile, redirect protected routes to profile form
router.beforeEach((to) => {
  try {
    const raw = localStorage.getItem("user_profile_v1");
    const hasProfile = !!raw && JSON.parse(raw)?.name;
    // Dashboard now at '/'; protect dashboard and exercise routes when no profile
    const protectedNames = ["dashboard", "exercise-new", "exercise-edit"];
    if (!hasProfile && protectedNames.includes(to.name)) {
      return { name: "profile" };
    }
    // If profile exists and user navigates to profile form, allow editing.
  } catch (e) {
    return { name: "profile" };
  }
});
