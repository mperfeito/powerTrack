import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/authStore";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [

    {
      path: "/",
      name: "initial",
      component: () => import("../views/InitialView.vue"),
    },
    {
      path: "/login",
      name: "login",
      component: () => import("../views/LoginView.vue"),
    },
    {
      path: "/register",
      name: "register",
      component: () => import("../views/RegisterView.vue"),
    },
    {
      path: "/dashboard",
      name: "dashboard",
      component: () => import("../views/DashboardView.vue"),
      // meta: { requiresAuth: true },
    },
    {
      path: "/settings",
      name: "settings",
      component: () => import("../views/SettingsView.vue"),
      // meta: { requiresAuth: true },
    },
    {
      path: "/houses",
      name: "houses",
      component: () => import("../views/HousesView.vue"),
      // meta: { requiresAuth: true },
    },
    {
      path: "/notifications",
      name: "notifications",
      component: () => import("../views/NotificationsView.vue"),
      // meta: { requiresAuth: true },
    },
    {
      path: "/appliances",
      name: "appliances",
      component: () => import("../views/AppliancesView.vue"),
      // meta: { requiresAuth: true },
    },
    {
      path: "/goals",
      name: "goals",
      component: () => import("../views/GoalsView.vue"),
      // meta: { requiresAuth: true },
    },


  ],
});


// router.beforeEach(async (to) => {
//   const authStore = useAuthStore()
//   const isAuthenticated = authStore.isAuthenticated
  
//   if (to.meta.requiresAuth && !isAuthenticated) {
//     return '/login'
//   }
  
//   if ((to.path === '/login' || to.path === '/register') && isAuthenticated) {
//     return '/dashboard'
//   }
// })


export default router;
