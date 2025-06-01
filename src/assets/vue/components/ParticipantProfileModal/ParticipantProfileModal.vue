<script setup lang="ts">
import { computed } from 'vue'

// Interface pour les données du participant
interface Participant {
  userId: string
  bio?: string
  availability?: string | string[]
  preferences?: Array<{
    label: string
    value: string
    _id?: string
  }>
  banner?: string
  status: 'confirmed' | 'pending' | 'declined'
  type: 'member' | 'outsider'
  username: string
  photo?: string
}

// Props du composant
const props = defineProps<{
  isVisible: boolean
  participant: Participant | null
}>()

// Émission d'événements
const emit = defineEmits<{
  close: []
}>()

const formattedAvailability = computed(() => {
  if (!props.participant?.availability) return 'Non renseigné'

  if (typeof props.participant.availability === 'string') {
    return props.participant.availability || 'Non renseigné'
  }

  if (Array.isArray(props.participant.availability)) {
    return props.participant.availability.length > 0
      ? props.participant.availability.join(', ')
      : 'Non renseigné'
  }

  return 'Non renseigné'
})

// Computed pour le badge de statut
const statusConfig = computed(() => {
  if (!props.participant) return { text: '', class: '' }

  switch (props.participant.status) {
    case 'confirmed':
      return { text: 'Confirmé', class: 'bg-green-100 text-green-700' }
    case 'pending':
      return { text: 'En attente', class: 'bg-yellow-100 text-yellow-700' }
    default:
      return { text: 'Inconnu', class: 'bg-gray-100 text-gray-700' }
  }
})

// Computed pour le badge de type
const typeConfig = computed(() => {
  if (!props.participant) return { text: '', class: '' }

  switch (props.participant.type) {
    case 'member':
      return { text: 'Membre', class: 'bg-blue-100 text-blue-700' }
    case 'outsider':
      return { text: 'Invité', class: 'bg-purple-100 text-purple-700' }
    default:
      return { text: 'Inconnu', class: 'bg-gray-100 text-gray-700' }
  }
})

function closeModal() {
  emit('close')
}

function handleBackdropClick(event: MouseEvent) {
  // event.currentTarget = the modal overlay/backdrop element
  // event.target = whatever was actually clicked
  if (event.target === event.currentTarget) {
    closeModal()
  }
}
</script>

<template>
  <div
    v-if="isVisible && participant"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click="handleBackdropClick"
  >
    <div class="bg-white rounded-lg overflow-hidden shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
      <!-- Bouton de fermeture -->
      <button
        @click="closeModal"
        class="absolute top-4 right-4 bg-white bg-opacity-20 backdrop-blur-sm p-2 rounded-full hover:bg-opacity-30 transition-all duration-200 z-10"
        title="Fermer"
      >
        <i class="fas fa-times text-white"></i>
      </button>

      <!-- Bannière -->
      <div class="relative h-32 bg-gradient-to-r from-blue-500 to-purple-600">
        <img
          v-if="participant.banner"
          :src="participant.banner"
          alt="Bannière du profil"
          class="w-full h-full object-cover"
        />
        <div class="absolute inset-0 bg-black bg-opacity-20"></div>

        <!-- Badges de statut et type -->
        <div class="absolute top-4 left-4 flex space-x-2">
          <span
            :class="['px-2 py-1 rounded-full text-xs font-medium', statusConfig.class]"
          >
            {{ statusConfig.text }}
          </span>
          <span
            :class="['px-2 py-1 rounded-full text-xs font-medium', typeConfig.class]"
          >
            {{ typeConfig.text }}
          </span>
        </div>
      </div>

      <!-- Contenu du profil -->
      <div class="p-6">
        <div class="flex flex-col items-center text-center relative -mt-12">
          <!-- Photo de profil -->
          <div class="relative">
            <img
              :src="participant.photo || 'https://afterworkly-media.s3.eu-north-1.amazonaws.com/logo-afterworkly.png'"
              :alt="`Photo de profil de ${participant.username}`"
              class="w-20 h-20 rounded-full shadow-lg object-cover border-4 border-white"
            />
          </div>

          <!-- Nom d'utilisateur -->
          <h2 class="text-xl font-bold text-gray-800 mt-3">{{ participant.username }}</h2>

          <!-- Bio -->
          <div v-if="participant.bio" class="mt-3">
            <p class="text-gray-600 text-sm">{{ participant.bio }}</p>
          </div>

          <!-- Disponibilités -->
          <div v-if="participant.type === 'member'" class="mt-4 w-full">
            <h3 class="text-sm font-semibold text-gray-700 mb-1">Disponibilités :</h3>
            <p class="text-gray-600 text-sm">{{ formattedAvailability }}</p>
          </div>

          <!-- Préférences alimentaires -->
          <div v-if="participant.type === 'member' && participant.preferences && participant.preferences.length > 0" class="mt-4 w-full">
            <h3 class="text-sm font-semibold text-gray-700 mb-2">Préférences alimentaires :</h3>
            <div class="flex flex-wrap gap-1 justify-center">
              <span
                v-for="pref in participant.preferences"
                :key="pref._id || pref.value"
                class="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs"
              >
                {{ pref.label }}
              </span>
            </div>
          </div>

          <!-- Si pas de préférences -->
          <div v-else class="mt-4 w-full">
            <h3 v-if="participant.type === 'member'" class="text-sm font-semibold text-gray-700 mb-1">Préférences alimentaires :</h3>
            <p  v-if="participant.type === 'member'" class="text-gray-500 text-sm">Non renseigné</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.z-50 {
  z-index: 50;
}
</style>
