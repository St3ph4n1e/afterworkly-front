import { createRouter, createWebHistory } from 'vue-router'
import DashboardPage from '@/assets/vue/pages/DashboardPage/DashboardPage.vue'
import CreateEventPage from '@/assets/vue/pages/CreateEventPage/CreateEventPage.vue'
import ProfilePage from '@/assets/vue/pages/ProfilePage/ProfilePage.vue'
import AuthPage from '@/assets/vue/pages/AuthPage/AuthPage.vue'
import EventDetailPage from '@/assets/vue/pages/EventDetailPage/EventDetailPage.vue'
import AllEventsPage from '@/assets/vue/pages/AllEventsPage/AllEventsPage.vue'

const routes = [
  {
    path: '/',
    name: 'dashboard',
    component: DashboardPage,
    meta: { requiresAuth: true }, // Nécessite une connexion
  },
  {
    path: '/create-event',
    name: 'createEvent',
    component: CreateEventPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfilePage,
    meta: { requiresAuth: true },
  },
  {
    path: '/event-detail/:id',
    name: 'EventDetail',
    component: EventDetailPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/all-events',
    name: 'allEvents',
    component: AllEventsPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/auth',
    name: 'auth',
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
