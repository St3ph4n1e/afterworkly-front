<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getEventById, toggleParticipantStatus } from '@/axios/api';
import { getImageUrl } from '@/utils/url';
import type { Event, EventParticipant } from '@/assets/vue/types/types';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';

dayjs.locale('fr');

const route = useRoute();
const router = useRouter();
const event = ref<Event | null>(null);
const isLoading = ref(true);
const errorMessage = ref<string | null>(null);
const currentUserId = ref<string | null>(null); // ID de l'utilisateur connecté
const attendanceConfirmed = ref(false);

// Mock de participants si non disponibles en BDD
const mockParticipants: EventParticipant[] = [
  { userId: '1', name: 'Grace', status: 'Confirmé', avatar: '/src/assets/images/grace-avatar.jpeg' },
  { userId: '2', name: 'Henry', status: 'Indécis', avatar: '/src/assets/images/henry-avatar.jpeg' },
];

// Récupération de l'événement et initialisation
onMounted(async () => {
  const eventId = route.params.id as string;

  // Récupérer l'utilisateur connecté depuis le localStorage
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    const user = JSON.parse(storedUser);
    currentUserId.value = user.userId;
  }

  try {
    isLoading.value = true;
    const fetchedEvent = await getEventById(eventId);

    // Utilisation de participants moqués si aucun participant en BDD
    event.value = {
      ...fetchedEvent,
      id: fetchedEvent._id, // Transformation de `_id` en `id`
      participants: fetchedEvent?.participants.length > 0 ? fetchedEvent?.participants : mockParticipants,
    };

    // Initialisation de l'état de participation
    attendanceConfirmed.value = event.value?.participants.some(
      (participant) => participant.userId === currentUserId.value && participant.status === 'Confirmé'
    ) ?? false;
  } catch (error: any) {
    console.error("Erreur lors de la récupération de l'événement :", error);
    errorMessage.value = "Impossible de charger l'événement.";
  } finally {
    isLoading.value = false;
  }
});

// Computed pour le style du thème
const themeStyle = computed(() => {
  if (event.value) {
    return {
      backgroundColor: event.value.color || '#f9f9f9',
    };
  }
  return {};
});

// Computed pour l'image de l'événement
const eventImage = computed(() => {
  return getImageUrl(event.value?.image || '/logo.png');
});

// Computed pour le formatage de la date et de l'heure
const formattedDate = computed(() => {
  return event.value ? dayjs(event.value.date).format('D MMMM YYYY') : '';
});

const formattedTime = computed(() => {
  return event.value?.time || '';
});

// Fonction pour confirmer/annuler la participation
async function toggleAttendance() {
  if (!event.value || !currentUserId.value) return;

  try {
    attendanceConfirmed.value = !attendanceConfirmed.value;
    await toggleParticipantStatus(event.value.id, {
      userId: currentUserId.value,
      status: attendanceConfirmed.value ? 'Confirmé' : 'Indécis',
    });
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour de la participation :', error);
  }
}

// Fonction pour ouvrir Google Maps
function openGoogleMaps() {
  if (event.value) {
    window.open(`https://www.google.com/maps/search/?q=${event.value.location}`, '_blank');
  }
}

// Fonction pour aller à la page de modification
function goToEditPage() {
  if (event.value) {
    router.push(`/edit-event/${event.value.id}`);
  }
}
</script>
<template>
  <div class="event-detail min-h-screen flex flex-col bg-gray-100">
    <HeaderComponent />

    <main class="container mx-auto p-4 flex-grow flex justify-center items-center">
      <!-- Indicateur de chargement -->
      <div v-if="isLoading" class="text-center">
        <p class="text-gray-500">Chargement...</p>
      </div>

      <!-- Affichage de l'événement -->
      <div v-else-if="event" class="w-full max-w-4xl bg-white shadow-lg rounded-lg overflow-hidden">
        <!-- Image de l'événement -->
        <div class="relative flex items-center justify-center h-72 sm:h-96" :style="themeStyle">
          <img
            :src="eventImage"
            alt="Image de l'événement"
            class="absolute w-4/6 h-auto object-contain rounded-lg"
          />
          <!-- Bouton Modifier (seulement pour le créateur) -->
          <button
            v-if="event.creator === currentUserId"
            @click="goToEditPage"
            class="absolute top-4 right-4 bg-blue-500 text-white p-2 rounded-full shadow-md hover:bg-blue-600"
            title="Modifier l'événement"
          >
            <i class="fas fa-edit"></i>
          </button>
        </div>

        <!-- Contenu principal -->
        <div class="p-6 space-y-6">
          <!-- Titre -->
          <div class="text-center">
            <h2 class="text-2xl font-bold text-gray-800">{{ event.title }}</h2>
          </div>

          <!-- Date et heure -->
          <div class="flex justify-center items-center space-x-4 text-gray-600">
            <p class="flex items-center">
              🗓️ <span class="ml-2 font-medium">{{ formattedDate }}</span>
            </p>
            <p class="flex items-center">
              🕒 <span class="ml-2 font-medium">{{ formattedTime }}</span>
            </p>
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
                :key="participant.userId"
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

          <!-- Confirmation de présence (si non créateur) -->
          <div v-if="event.creator !== currentUserId" class="flex items-center justify-center space-x-4 mt-4">
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