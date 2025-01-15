import { createRouter, createWebHistory } from 'vue-router'
import DashboardPage from '@/assets/vue/pages/DashboardPage/DashboardPage.vue'
import CreateEventPage from '@/assets/vue/pages/CreateEventPage/CreateEventPage.vue'
import ProfilePage from '@/assets/vue/pages/ProfilePage/ProfilePage.vue'
import AuthPage from '@/assets/vue/pages/AuthPage/AuthPage.vue'
import EventDetailPage from '@/assets/vue/pages/EventDetailPage/EventDetailPage.vue'

const routes = [
  {
    path: '/',
    component: DashboardPage,
    meta: { requiresAuth: true }, // Nécessite une connexion
  },
  {
    path: '/create-event',
    component: CreateEventPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/profile',
    component: ProfilePage,
    meta: { requiresAuth: true },
  },
  {
    path: '/event-detail/:id',
    component: EventDetailPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/auth',
    component: AuthPage,
  },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/assets/vue/pages/NotFoundPage/NotFoundPage.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation Guard pour protéger les routes
router.beforeEach((to, from, next) => {
  const user = localStorage.getItem('user')
  if (to.meta.requiresAuth && !user) {
    next('/auth')
  } else {
    next()
  }
})

export default router
