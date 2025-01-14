import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '@/assets/vue/pages/DashBoard/Dashboard.vue'
import CreateEvent from '@/assets/vue/pages/CreateEvent/CreateEvent.vue'
import EventDetail from '@/assets/vue/pages/EventDetail/EventDetail.vue'
import Profile from '@/assets/vue/pages/Profile/Profile.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Dashboard,
    },
    {
      path: '/create-event',
      name: 'create-event',
      component: CreateEvent,
    },
    {
      path: '/event-detail/:id',
      name: 'event-detail',
      component: EventDetail,
    },
    {
      path: '/profile',
      name: 'profile',
      component: Profile,
    },
  ],
})

export default router
