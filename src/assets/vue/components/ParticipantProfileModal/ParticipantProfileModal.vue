<script setup lang="ts">
import { computed, watch, nextTick, onUnmounted } from 'vue'

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

// Bloquer le scroll quand la modal est ouverte
watch(() => props.isVisible, (newValue) => {
  nextTick(() => { // assure que le DOM est complètement affiché avant d'executer le code
    if (newValue) {
      // Bloquer le scroll
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = getScrollbarWidth() + 'px' // compense le manque de width sans la scrollbar qui a été retiré
    } else {
      // Rétablir le scroll
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
  })
})

// Nettoyer le scroll en cas de destruction du composant
onUnmounted(() => {
  document.body.style.overflow = ''
  document.body.style.paddingRight = ''
})

// Fonction pour calculer la largeur de la scrollbar
function getScrollbarWidth(): number {
  return window.innerWidth - document.documentElement.clientWidth
}

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
  <Transition
    name="modal"
    appear
  >
    <div
      v-if="isVisible && participant"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-backdrop"
      @click="handleBackdropClick"
    >
      <Transition
        name="modal-content"
        appear
      >
        <div class="bg-white rounded-lg overflow-hidden shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto modal-content">
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

            <!-- Bouton de fermeture dans la bannière -->
            <button
              @click="closeModal"
              class="absolute top-4 right-4 bg-white bg-opacity-20 backdrop-blur-sm p-2 rounded-full hover:bg-opacity-30 transition-all duration-200 z-10"
              title="Fermer"
            >
              <i class="fas fa-times text-white"></i>
            </button>
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
                <p v-if="participant.type === 'member'" class="text-gray-500 text-sm">Non renseigné</p>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<style scoped>
/* Transitions pour la modal backdrop */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease-out;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-to,
.modal-leave-from {
  opacity: 1;
}

/* Transitions pour le contenu de la modal */
.modal-content-enter-active,
.modal-content-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-content-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(-20px);
}

.modal-content-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}

.modal-content-enter-to,
.modal-content-leave-from {
  opacity: 1;
  transform: scale(1) translateY(0);
}

/* Style pour la modal */
.modal-backdrop {
  backdrop-filter: blur(2px);
  animation: fadeInBackdrop 0.3s ease-out;
}

.modal-content {
  animation: slideInContent 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

/* Animations keyframes pour un effet plus fluide */
@keyframes fadeInBackdrop {
  from {
    opacity: 0;
    backdrop-filter: blur(0px);
  }
  to {
    opacity: 1;
    backdrop-filter: blur(2px);
  }
}

@keyframes slideInContent {
  from {
    opacity: 0;
    transform: scale(0.8) translateY(-30px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Amélioration de l'hover effect sur le bouton de fermeture */
.modal-content button:hover {
  transform: scale(1.1);
}

/* Z-index pour assurer que la modal est bien au-dessus de tout */
.z-50 {
  z-index: 50;
}

/* Empêcher la sélection du texte lors du clic sur le backdrop */
.modal-backdrop {
  user-select: none;
}

/* Style pour les badges avec animation */
.modal-content span {
  transition: transform 0.2s ease;
}

.modal-content span:hover {
  transform: scale(1.05);
}

/* Animation pour la photo de profil */
.modal-content img {
  transition: transform 0.3s ease;
}

.modal-content img:hover {
  transform: scale(1.02);
}
</style>
