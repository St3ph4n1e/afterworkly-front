import { createRouter, createWebHistory } from 'vue-router'
import OfflinePage from '../assets/vue/pages/OfflinePage/OfflinePage.vue';
import { getMessagingToken } from '@/utils/firebase.ts'


const DashboardPage = () => import('@/assets/vue/pages/DashboardPage/DashboardPage.vue');
const CreateEventPage = () => import('@/assets/vue/pages/CreateEventPage/CreateEventPage.vue');
const ProfilePage = () => import('@/assets/vue/pages/ProfilePage/ProfilePage.vue');
const AuthPage = () => import('@/assets/vue/pages/AuthPage/AuthPage.vue');
const EventDetailPage = () => import('@/assets/vue/pages/EventDetailPage/EventDetailPage.vue');
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
  }

]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

//Navigation Guard pour protéger les routes
router.beforeEach(async (to, from, next) => {
  const user = sessionStorage.getItem('user')
  try {
      // Permet aussi de faire la demande d'acceptation des notifications
      await getMessagingToken();
  } catch (error) {
    console.error(error)
  }
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
