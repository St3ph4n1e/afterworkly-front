<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { mockEvents } from '../../mocks/events'

const router = useRouter()
const userName = ref('')

// Filtre pour les 3 derniers événements à venir

const upcomingEvents = computed(() => mockEvents.slice(0, 3))

// Vérifie si l'utilisateur est connecté
onMounted(() => {
  const storedUser = localStorage.getItem('user')
  if (storedUser) {
    const user = JSON.parse(storedUser)
    userName.value = user.name
  } else {
    router.push('/auth')
  }
})

// Redirige vers la page de tous les événements
function viewAllEvents() {
  router.push('/all-events')
}
</script>

<template>
  <div>
    <HeaderComponent />
    <div class="container mx-auto p-4">
      <!-- Message de bienvenue -->
      <h1 class="text-2xl font-bold mb-6">Bienvenue, {{ userName }} !</h1>

      <!-- Notifications -->
      <NotificationComponent
        message="📢 Annulation d'un événement : Tous les participants ont été notifiés."
      />

      <!-- Liste des événements -->
      <section class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <EventCardComponent
          v-for="event in upcomingEvents"
          :key="event.id"
          :id="event.id"
          :title="event.title"
          :location="event.location"
          :date="event.date"
          :image="event.image"
        />
      </section>

      <!-- Bouton pour voir plus d'événements -->
      <div class="text-center mt-6">
        <button
          @click="viewAllEvents"
          class="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition"
        >
          Voir plus d'événements
        </button>
      </div>
    </div>
    <FooterComponent />
  </div>
</template>

<style src="./DashboardPage.css" lang="css" scoped></style>
