<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router';
import 'dayjs/locale/fr';
import dayjs from 'dayjs';

dayjs.locale('fr');

// Définition des props
const props = defineProps({
  id: { type: String, required: true },
  title: { type: String, default: 'Titre indisponible' },
  location: { type: String, default: 'Lieu indisponible' },
  date: { type: String, required: true },
  time: { type: String, required: true },
  image: { type: String, default: 'https://afterworkly-media.s3.eu-north-1.amazonaws.com/logo-afterworkly.png' },
});

const router = useRouter();

// Computed pour l'image de l'événement
// const eventImage = computed(() => getImageUrl(props.image));

// Computed pour formater la date
const formattedDate = computed(() => {
  return dayjs(props.date).isValid()
    ? dayjs(props.date).format('D MMMM YYYY')
    : 'Date invalide';
});

// Méthode pour naviguer vers la page de détail de l'événement
function viewEvent(eventId: string) {
  router.push(`/event-detail/${eventId}`);
}

// Méthode pour ouvrir la localisation dans Google Maps
function openGoogleMaps(location: string) {
  if (!location) {
    console.error('Lieu non disponible');

    return;
  }
  const encodedLocation = encodeURIComponent(location);
  window.open(`https://www.google.com/maps/search/?q=${encodedLocation}`, '_blank');
}
</script>

<template>
  <div
    class="aftw-event-card bg-white shadow rounded-lg p-6 flex flex-col items-center space-y-4 mx-6 transition transform hover:scale-105 hover:shadow-xl h-full"
  >
    <!-- Image ou logo -->
    <div class="w-full h-56 overflow-hidden rounded-lg bg-gray-200">
      <img :src="image" :alt="`Image de l'événement : ${title}`" class="w-full h-full object-cover" />
    </div>

    <!-- Titre de l'événement -->
    <h3 class="text-lg font-bold text-center text-gray-800">{{ title }}</h3>

    <!-- Localisation -->
    <p
      class="text-gray-600 text-center cursor-pointer hover:text-blue-500 transition"
      @click="openGoogleMaps(location)"
      title="Ouvrir la localisation dans Google Maps"
    >
      📍 <span class="font-medium">{{ location }}</span>
    </p>

    <!-- Date et heure -->
    <p class="text-gray-600 text-center">
      🗓️ <span class="font-medium">{{ formattedDate }}</span>
    </p>
    <p class="text-gray-600 text-center">
      🕒 <span class="font-medium">{{ time }}</span>
    </p>

    <!-- Bouton -->
    <button
      @click="viewEvent(id)"
      class="mt-auto bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-lg hover:from-purple-500 hover:to-blue-500 transition"
      aria-label="Voir les détails de l'événement"
    >
      Voir l'événement
    </button>
  </div>
</template>

<style src="./EventCardComponent.css" module></style>
