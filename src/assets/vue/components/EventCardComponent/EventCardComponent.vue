<script setup lang="ts">
import { useRouter } from 'vue-router'

defineProps<{
  id: number
  title: string
  location: string
  date: string
  image?: string // Image de l'événement, facultative
}>()

const router = useRouter()

function viewEvent(eventId: number) {
  router.push(`/event-detail/${eventId}`)
}
</script>

<template>
  <div class="bg-white shadow rounded-lg p-4 flex flex-col items-center space-y-4">
    <!-- Image ou logo -->
    <img
      :src="image || '/logo.png'"
      alt="Image de l'événement"
      class="w-24 h-24 rounded-full object-cover"
    />

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
      class="mt-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-full hover:from-purple-500 hover:to-blue-500 transition"
    >
      Voir l'événement
    </button>
  </div>
</template>

<style src="./EventCardComponent.css" lang="css" scoped></style>
