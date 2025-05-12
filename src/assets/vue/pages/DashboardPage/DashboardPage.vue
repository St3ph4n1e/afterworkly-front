<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router';
import { getEvents } from '@/axios/api';
import type { Event } from '@/assets/vue/types/types';
import { getSocket, setupSocket } from '@/utils/socket.ts'

const router = useRouter();
const userName = ref('');
const events = ref<Event[]>([]);

const isLoading = ref(true);
const errorMessage = ref<string | null>(null);


let socket: any = null

// Vérifie si l'utilisateur est connecté
onMounted(async () => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    const user = JSON.parse(storedUser);
    userName.value = user.username || 'Utilisateur';
  } else {
    router.push('/auth');
    return;
  }

  // Charge les événements depuis l'API
  try {
    const response = await getEvents({ page: 1, limit: 3 }); // Appel API avec pagination
    events.value = response;

  } catch (error) {
    console.error('Erreur lors du chargement des événements :', error);
    errorMessage.value = 'Impossible de charger les événements. Veuillez réessayer plus tard.';
  } finally {
    isLoading.value = false;
  }

  socket = setupSocket();

  socket.on('event-update-dashboard', (updatedEvents) => {
    if (updatedEvents) {
      events.value = updatedEvents;
    }

  })

});

// Navigation vers les pages
function viewAllEvents() {
  router.push('/all-events');
}

function createEvent() {
  router.push('/create-event');
}

onUnmounted(() => {
  if (socket) {
    socket.off('event-update-dashboard')
  }
})
</script>

<template>
  <div>
    <HeaderComponent />
    <div class="container mx-auto p-4">
      <!-- Message de bienvenue -->
      <h1
        class="text-3xl font-bold mb-8 text-center lg:text-left bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 text-transparent bg-clip-text"
      >
        Bienvenue, {{ userName }} <span class="text-gray-800">😃</span> !
      </h1>

      <!-- Indicateur de chargement -->
      <div v-if="isLoading" class="text-center">
        <p class="text-gray-500">Chargement des événements...</p>
      </div>
      <!-- Notifications -->
      <!--<NotificationComponent
        message="📢 Annulation d'un événement : Tous les participants ont été notifiés."
      />-->

      <!-- Message d'erreur -->
      <div v-if="errorMessage" class="text-center text-red-500">
        <p>{{ errorMessage }}</p>
      </div>

      <!-- Liste des événements et carte d'action -->
      <section v-if="!isLoading && !errorMessage" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6 items-stretch">
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
          v-for="event in events"
          :key="event.id"
          :id="event.id"
          :is-public="event.isPublic"
          :title="event.title || 'Titre indisponible'"
          :location="event.location || 'Lieu indisponible'"
          :date="event.date"
          :time="event.time"
          :image="event.image || 'https://afterworkly-media.s3.eu-north-1.amazonaws.com/logo-afterworkly.png'"
        />

      </section>
    </div>
    <FooterComponent />
  </div>
</template>

<style src="./DashboardPage.css" lang="css" scoped></style>
