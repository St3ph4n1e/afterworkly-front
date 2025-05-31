import { createRouter, createWebHistory } from 'vue-router'
import OfflinePage from '../assets/vue/pages/OfflinePage/OfflinePage.vue';
import OutsiderJoiningPage from '@/assets/vue/pages/OutsiderJoiningPage/OutsiderJoiningPage.vue'


const DashboardPage = () => import('@/assets/vue/pages/DashboardPage/DashboardPage.vue');
const CreateEventPage = () => import('@/assets/vue/pages/CreateEventPage/CreateEventPage.vue');
const ProfilePage = () => import('@/assets/vue/pages/ProfilePage/ProfilePage.vue');
const AuthPage = () => import('@/assets/vue/pages/AuthPage/AuthPage.vue');
const EventDetailPage = () => import('@/assets/vue/pages/EventDetailPage/EventDetailPage.vue');
const EventDetailOutsiderPage = () => import('@/assets/vue/pages/EventDetailOutsiderPage/EventDetailOutsiderPage.vue');
const AllEventsPage = () => import('@/assets/vue/pages/AllEventsPage/AllEventsPage.vue');


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
    path: '/event-detail-outsider/:id',
    name: 'EventDetailOutsiderPage',
    component: EventDetailOutsiderPage,
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
    meta: { requiresAuth: true },
  },
  {
    path: '/offline',
    name: 'offline',
    component: OfflinePage,
  },
  {
    path: '/join',
    name: 'join',
    component: OutsiderJoiningPage,
  }


]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation Guard pour protéger les routes
router.beforeEach(async (to, from, next) => {
  const user = localStorage.getItem('user')
  if (!navigator.onLine && to.name !== 'offline') {
    sessionStorage.setItem('offlineRedirectPath', to.fullPath);
    next('/offline');
  } else if (to.meta.requiresAuth && !user) {
    next('/auth');
  } else {
    next();
  }
});


export default router
