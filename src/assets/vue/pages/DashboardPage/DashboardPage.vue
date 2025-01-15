<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { mockEvents } from '../../mocks/events'

const router = useRouter()
const userName = ref('')
const isAnimationActive = ref(true) // Contrôle l'état de l'animation

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

  // Arrête l'animation après 5 secondes
  setTimeout(() => {
    isAnimationActive.value = false
  }, 5000)
})

// Navigation vers les pages
function viewAllEvents() {
  router.push('/all-events')
}

function createEvent() {
  router.push('/create-event')
}
</script>

<template>
  <div>
    <HeaderComponent />
    <div class="container mx-auto p-4">
      <!-- Message de bienvenue -->
      <h1
        :class="[
          'text-3xl font-bold mb-8 text-center lg:text-left',
          isAnimationActive ? 'sparkle-animation' : '',
          'bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 text-transparent bg-clip-text',
        ]"
      >
        Bienvenue, {{ userName }} <span class="text-gray-800">😃</span> !
      </h1>

      <!-- Notifications -->
      <NotificationComponent
        message="📢 Annulation d'un événement : Tous les participants ont été notifiés."
      />

      <!-- Liste des événements et carte d'action -->
      <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6 items-start">
        <!-- Carte d'action -->
        <div
          class="bg-white shadow-lg rounded-lg p-6 flex flex-col justify-center items-center space-y-4 h-full"
        >
          <!-- Bouton pour créer un événement -->
          <button
            @click="createEvent"
            class="flex items-center justify-center bg-green-500 text-white w-16 h-16 rounded-full shadow-md hover:bg-green-600 transition"
            title="Créer un nouvel événement"
          >
            <i class="fa-solid fa-plus text-2xl"></i>
          </button>
          <p class="text-center text-gray-700 font-medium">Créer un nouvel événement</p>

          <!-- Bouton pour voir tous les événements -->
          <button
            @click="viewAllEvents"
            class="bg-blue-500 text-white w-full py-2 rounded-lg hover:bg-blue-600 shadow-md transition"
          >
            Voir tous les événements
          </button>
        </div>

        <!-- Cartes des événements -->
        <EventCardComponent
          v-for="event in upcomingEvents"
          :key="event.id"
          :id="event.id"
          :title="event.title"
          :location="event.location"
          :date="event.date"
          :image="event.image || '/src/assets/images/logo.png'"
        />
      </section>
    </div>
    <FooterComponent />
  </div>
</template>

<style src="./DashboardPage.css" lang="css" scoped></style>
