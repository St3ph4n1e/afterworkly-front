<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import HeaderComponent from '../../components/HeaderComponent/HeaderComponent.vue'
import FooterComponent from '../../components/FooterComponent/FooterComponent.vue'
import ParticipantListComponent from '../../components/ParticipantListComponent/ParticipantListComponent.vue'

// Liste d'événements fictifs
const events = [
  {
    id: '1',
    title: 'Afterwork du Vendredi',
    date: '20 Décembre 2024',
    description: 'Une soirée conviviale pour échanger entre collègues et amis.',
    location: 'Café de Paris',
    participants: [
      { name: 'Jean', status: 'Confirmé' },
      { name: 'Marie', status: 'Indécis' },
    ],
  },
  {
    id: '2',
    title: 'Afterwork du Lundi',
    date: '18 Décembre 2024',
    description: 'Un moment pour discuter entre collègues après un début de semaine chargé.',
    location: 'Bar Le Coco',
    participants: [
      { name: 'Alice', status: 'Confirmé' },
      { name: 'Bob', status: 'Indécis' },
    ],
  },
]

// Récupérer les paramètres de la route
const route = useRoute()
const router = useRouter()
const event = ref(null) // Événement sélectionné

onMounted(() => {
  const eventId = route.params.id // Récupère l'ID de l'événement
  event.value = events.find((e) => e.id === eventId)

  // Redirige vers la page 404 si l'événement n'existe pas
  if (!event.value) {
    router.push('/404')
  }
})

// Gestion de la confirmation de présence
const attendanceConfirmed = ref(false)

function toggleAttendance() {
  attendanceConfirmed.value = !attendanceConfirmed.value
}

// Ouvrir Google Maps
function openGoogleMaps() {
  if (event.value) {
    window.open(`https://www.google.com/maps/search/?q=${event.value.location}`, '_blank')
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-100">
    <HeaderComponent />

    <main class="container mx-auto p-4 flex-grow space-y-6">
      <!-- Affichage de l'événement s'il est trouvé -->
      <div v-if="event">
        <h2 class="text-2xl font-bold text-gray-800">{{ event.title }}</h2>
        <p class="text-gray-600">{{ event.date }}</p>
        <p class="mt-4 text-gray-700">{{ event.description }}</p>

        <!-- Localisation -->
        <div class="mt-4">
          <p
            @click="openGoogleMaps"
            class="text-blue-500 underline cursor-pointer"
            title="Ouvrir dans Google Maps"
          >
            {{ event.location }}
          </p>
          <button
            class="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            @click="openGoogleMaps"
          >
            Ouvrir Google Maps
          </button>
        </div>

        <!-- Liste des participants -->
        <div class="mt-6">
          <h3 class="font-semibold text-gray-800">Participants</h3>
          <ParticipantListComponent :participants="event.participants" />
        </div>

        <!-- Confirmation de présence -->
        <div class="mt-6">
          <label class="flex items-center space-x-2">
            <input
              type="checkbox"
              v-model="attendanceConfirmed"
              @change="toggleAttendance"
              class="rounded border-gray-300 focus:ring focus:ring-blue-300"
            />
            <span class="text-gray-800">
              {{ attendanceConfirmed ? 'Présence confirmée' : 'Non confirmé' }}
            </span>
          </label>
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

<style scoped>
/* Ajout de styles spécifiques */
.container {
  margin-top: 1rem;
}
</style>
