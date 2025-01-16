<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { mockEvents } from '../../mocks/events'
import type { Event } from '../../types/types'

const route = useRoute()
const router = useRouter()
const event = ref<Event | null>(null)
const isLoading = ref(true)
const attendanceConfirmed = ref(false)

onMounted(() => {
  const eventId = Number(route.params.id)
  if (isNaN(eventId)) {
    console.error('Invalid event ID:', route.params.id)
    router.push('/404')
    return
  }

  event.value = mockEvents.find((e) => e.id === eventId) || null

  if (!event.value) {
    console.error('Event not found for ID:', eventId)
    router.push('/404')
  }

  // Initialisation de l'état "confirmé"
  attendanceConfirmed.value = !!localStorage.getItem(`event-${eventId}-confirmed`)

  isLoading.value = false
})

// Computed pour le style du thème
const themeStyle = computed(() => {
  if (event.value) {
    return {
      backgroundColor: event.value.color || '#f9f9f9',
    }
  }
  return {}
})

// Computed pour l'image ou le logo par défaut
const eventImage = computed(() => {
  return event.value?.image ? event.value?.image : '/src/assets/images/logo.png'
})

// Gestion du toggle
function toggleAttendance() {
  attendanceConfirmed.value = !attendanceConfirmed.value
  const eventId = route.params.id
  if (attendanceConfirmed.value) {
    localStorage.setItem(`event-${eventId}-confirmed`, 'true')
  } else {
    localStorage.removeItem(`event-${eventId}-confirmed`)
  }
}

function openGoogleMaps() {
  if (event.value) {
    window.open(`https://www.google.com/maps/search/?q=${event.value.location}`, '_blank')
  }
}
</script>

<template>
  <div class="event-detail min-h-screen flex flex-col bg-gray-100">
    <HeaderComponent />

    <main class="container mx-auto p-4 flex-grow flex justify-center items-center">
      <!-- Affichage pendant le chargement -->
      <div v-if="isLoading" class="text-center">
        <p class="text-gray-500">Chargement...</p>
      </div>

      <!-- Affichage de l'événement -->
      <div v-else-if="event" class="w-full max-w-4xl bg-white shadow-lg rounded-lg overflow-hidden">
        <!-- Section supérieure : Couleur de thème avec image centrée -->
        <div class="relative flex items-center justify-center h-64 sm:h-80" :style="themeStyle">
          <img
            :src="eventImage"
            alt="Image de l'événement"
            class="absolute w-5/6 h-auto object-contain rounded-lg"
          />
        </div>

        <!-- Contenu de la carte -->
        <div class="p-6 space-y-6">
          <!-- Titre et date -->
          <div class="text-center">
            <h2 class="text-2xl font-bold text-gray-800">{{ event.title }}</h2>
            <p class="text-gray-600">{{ event.date }}</p>
          </div>

          <!-- Description -->
          <p class="text-gray-700 text-center">{{ event.description }}</p>

          <!-- Localisation -->
          <div class="text-center">
            <p
              @click="openGoogleMaps"
              class="event-detail-location text-blue-500 font-medium cursor-pointer transition hover:text-blue-700"
              title="Ouvrir dans Google Maps"
            >
              📍 {{ event.location }}
            </p>
          </div>

          <!-- Liste des participants -->
          <div>
            <h3 class="font-semibold text-gray-800">Participants</h3>
            <ul class="space-y-2">
              <li
                v-for="participant in event.participants"
                :key="participant.name"
                class="flex items-center space-x-4"
              >
                <img
                  :src="participant.avatar || '/src/assets/images/default-avatar.png'"
                  alt="Avatar"
                  class="w-10 h-10 rounded-full object-cover border border-gray-300"
                />
                <span class="text-gray-800 font-medium">{{ participant.name }}</span>
                <span
                  class="text-sm"
                  :class="{
                    'text-green-600': participant.status === 'Confirmé',
                    'text-yellow-600': participant.status === 'Indécis',
                  }"
                >
                  ({{ participant.status }})
                </span>
              </li>
            </ul>
          </div>

          <!-- Confirmation de présence -->
          <div class="flex items-center justify-center space-x-4 mt-4">
            <span class="text-gray-800 font-medium">
              {{ attendanceConfirmed ? 'Présence confirmée' : 'Non confirmé' }}
            </span>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                v-model="attendanceConfirmed"
                class="sr-only peer"
                @click="toggleAttendance"
                aria-label="Confirmer ou annuler la présence"
              />
              <div
                class="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-500 peer-focus:ring-4 peer-focus:ring-blue-300 transition"
              ></div>
              <div
                class="absolute w-4 h-4 bg-white rounded-full top-1 left-1 peer-checked:left-6 transition"
              ></div>
            </label>
          </div>
        </div>
      </div>

      <!-- Affichage si aucun événement trouvé -->
      <div v-else class="text-center">
        <h2 class="text-2xl font-bold text-gray-800">Événement introuvable</h2>
        <p class="text-gray-600 mt-2">
          L'événement que vous recherchez n'existe pas ou a été supprimé.
        </p>
        <router-link
          to="/"
          class="inline-block mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          Retour à l'accueil
        </router-link>
      </div>
    </main>

    <FooterComponent />
  </div>
</template>

<style src="./EventDetailPage.css" lang="css" scoped></style>
