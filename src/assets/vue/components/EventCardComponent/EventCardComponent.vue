<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { getImageUrl } from '@/utils/url';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';

dayjs.locale('fr');

// Définition des props
const props = defineProps<{
  id: string;
  title: string;
  location: string;
  date: string;
  time: string;
  image?: string;
}>();

const router = useRouter();

// Computed pour l'image de l'événement
const eventImage = computed(() => {
  return getImageUrl(props.image || '/logo.png');
});

// Computed pour formater la date et l'heure
const formattedDate = computed(() => {
  return dayjs(props.date).format('D MMMM YYYY');
});


// Méthode pour naviguer vers la page de détail de l'événement
function viewEvent(eventId: string) {
  router.push(`/event-detail/${eventId}`);
}

// Méthode pour ouvrir la localisation dans Google Maps
function openGoogleMaps(location: string) {
  window.open(`https://www.google.com/maps/search/?q=${location}`, '_blank');
}
</script>

<template>
  <div
    class="aftw-event-card bg-white shadow rounded-lg p-6 flex flex-col items-center space-y-4 mx-6 transition transform hover:scale-105 hover:shadow-xl"
  >
    <!-- Image ou logo -->
    <div class="w-full h-56 overflow-hidden rounded-lg bg-gray-200">
      <img :src="eventImage" :alt="`Image de l'événement : ${title}`" class="w-full h-full object-cover" />
    </div>

    <!-- Titre de l'événement -->
    <h3 class="text-lg font-bold text-center text-gray-800">{{ title || 'Titre indisponible' }}</h3>

    <!-- Localisation -->
    <p
      class="text-gray-600 text-center cursor-pointer hover:text-blue-500 transition"
      @click="openGoogleMaps(location)"
      title="Ouvrir la localisation dans Google Maps"
    >
      📍 <span class="font-medium">{{ location || 'Lieu indisponible' }}</span>
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
      class="mt-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-lg hover:from-purple-500 hover:to-blue-500 transition"
    >
      Voir l'événement
    </button>
  </div>
</template>


 

<style src="./EventCardComponent.css" module></style>
