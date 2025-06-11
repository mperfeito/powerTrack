import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/authStore";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "initial",
      component: () => import("../views/InitialView.vue"),
      meta: { requiresGuest: true } 
    },
    {
      path: "/login",
      name: "login",
      component: () => import("../views/LoginView.vue"),
      meta: { requiresGuest: true }
    },
    {
      path: "/register",
      name: "register",
      component: () => import("../views/RegisterView.vue"),
      meta: { requiresGuest: true }
    },
    // Admin routes
    {
      path: "/admin",
      name: "admin",
      redirect: '/admin/users',
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: "/admin/users",
      name: "admin-users",
      component: () => import("../views/AdminView.vue"),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: "/dashboard",
      name: "dashboard",
      component: () => import("../views/DashboardView.vue"),
      meta: { requiresAuth: true } 
    },
    {
      path: "/settings",
      name: "settings",
      component: () => import("../views/SettingsView.vue"),
      meta: { requiresAuth: true }
    },
    {
      path: "/houses",
      name: "houses",
      component: () => import("../views/HousesView.vue"),
      meta: { requiresAuth: true }
    },
    {
      path: "/notifications",
      name: "notifications",
      component: () => import("../views/NotificationsView.vue"),
      meta: { requiresAuth: true }
    },
    {
      path: "/appliances",
      name: "appliances",
      component: () => import("../views/AppliancesView.vue"),
      meta: { requiresAuth: true }
    },
    {
      path: "/goals",
      name: "goals",
      component: () => import("../views/GoalsView.vue"),
      meta: { requiresAuth: true }
    }, 
    { 
      path:"/admin", 
      name: "admin", 
      component: () => import("../views/AdminView.vue"),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("../views/NotFoundView.vue")
    }
  ],
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  
  // If route requires authentication
  if (to.meta.requiresAuth) {
    if (authStore.isAuthenticated) {
      // If route requires admin privileges
      if (to.meta.requiresAdmin) {
        if (authStore.isAdmin) {
          next();
        } else {
          next('/dashboard'); // Redirect non-admins to dashboard
        }
      } else {
        next();
      }
    } else {
      // Not authenticated, redirect to login with return url
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      });
    }
  } 
  // If route requires guest (non-authenticated) status
  else if (to.meta.requiresGuest) {
    if (authStore.isAuthenticated) {
      // Redirect authenticated users to appropriate dashboard
      if (authStore.isAdmin) {
        next('/admin');
      } else {
        next('/dashboard');
      }
    } else {
      next();
    }
  } 
  // All other routes
  else {
    next();
  }
});

export default router;