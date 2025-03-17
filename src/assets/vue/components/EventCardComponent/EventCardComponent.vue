<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps<{
  id: number
  title: string
  location: string
  date: string
  image?: string 
}>()

const router = useRouter()

// Computed 
const eventImage = computed(() => {
  return props.image ? new URL(props.image, import.meta.url).href : './logo.png'
})

// Methods
function viewEvent(eventId: number) {
  router.push(`/event-detail/${eventId}`)
}
</script>

<template>
  <div
    class="aftw-event-card bg-white shadow rounded-lg p-6 flex flex-col items-center space-y-4 transition transform hover:scale-105 hover:shadow-xl"
  >
    <!-- Image ou logo -->
    <div class="w-full h-56 overflow-hidden rounded-lg bg-gray-200">
      <img :src="eventImage" alt="Image de l'événement" class="w-full h-full object-cover" />
    </div>

    <!-- Titre de l'événement -->
    <h3 class="text-lg font-bold text-center text-gray-800">{{ title }}</h3>

    <!-- Localisation -->
    <p class="text-gray-600 text-center">
      📍 <span class="font-medium">{{ location }}</span>
    </p>

    <!-- Date -->
    <p class="text-gray-600 text-center">
      🕒 <span class="font-medium">{{ date }}</span>
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

<style src="./EventCardComponent.css" lang="css" scoped></style>
