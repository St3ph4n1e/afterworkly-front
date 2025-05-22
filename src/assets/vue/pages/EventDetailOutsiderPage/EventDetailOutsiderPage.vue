<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { formatDate } from '@/utils/date'
import {
  getEventById,
  getEventByIdForOutsider, exitEventForOutsider
} from '@/axios/api'
import type { Event } from '@/assets/vue/types/types'
import { showError, currentNotification } from '../../../../utils/errors.ts'
import axios from 'axios'
import dayjs from 'dayjs'
import 'dayjs/locale/fr'

dayjs.locale('fr')

const route = useRoute()
const router = useRouter()
const event = ref<Event | null>(null)
const isLoading = ref(true)
const currentUserId = ref<string | null>(null)
const attendanceConfirmed = ref<'confirmed' | 'pending' | 'not_joined' >('not_joined')
const showEditButtons = ref(false)
const showImageModal = ref(false)
const notification = ref<{ message: string; type: 'success' | 'error'; visible: boolean }>({
  message: '',
  type: 'success',
  visible: false,
})
const showQuitModal = ref(false)

const formData = ref({
  eventName: '',
  eventDate: '',
  eventTime: '',
  eventLocation: '',
  eventImage: null as File | null,
  eventColor: '#f9f9f9',
  eventIsPublic: true,
  eventDescription: '',
  code: ''
})

const scrollContainer = ref<HTMLDivElement | null>(null)

function scrollLeft() {
  if (scrollContainer.value) {
    scrollContainer.value.scrollLeft -= 200 // Scroll de 200px vers la gauche
  }
}

function scrollRight() {
  if (scrollContainer.value) {
    scrollContainer.value.scrollLeft += 200 // Scroll de 200px vers la right
  }
}


const eventId = route.params.id as string
onMounted(async () => {
  // Vérifier si l'utilisateur est déjà connecté
  const accessToken = localStorage.getItem('access_token');
  const refreshToken = localStorage.getItem('refresh_token');
  const user = localStorage.getItem('user');

  if (accessToken && refreshToken && user) {
    router.push('/');
    return;
  }

  const outsider = localStorage.getItem('outsider')
  if (!outsider) {
    router.push('/')
    return
  }


  try {
    isLoading.value = true
    let fetchedEvent = await getEventByIdForOutsider(eventId)

    if (!fetchedEvent) {
      showError('Événement introuvable.')
      router.push('/404')
      return
    }

    fetchedEvent = fetchedEvent.event


    event.value = {
      ...fetchedEvent,
      id: fetchedEvent._id,
    }

    // Remplir formData
    formData.value.eventName = fetchedEvent.title
    formData.value.eventDate = fetchedEvent.date
    formData.value.eventTime = fetchedEvent.time
    formData.value.eventLocation = fetchedEvent.location
    formData.value.eventDescription = fetchedEvent.description
    formData.value.eventColor = fetchedEvent.color || '#f9f9f9'
    formData.value.eventIsPublic = fetchedEvent.isPublic
    // formData.value.code = fetchedEvent.code

    // Gérer l'image
    formData.value.eventImage = fetchedEvent.image ?? null

  } catch (error) {
    console.error("Erreur lors de la récupération de l'événement :", error)
    if (axios.isAxiosError(error)) {
      if (error.response && error.response.status === 404) {
        showError("L'événement demandé n'a pas été trouvé.")
        setTimeout(() => router.push('/404'), 3000)
      } else {
        showError(error.response?.data.message || "L'événement demandé n'a pas été trouvé.")
        setTimeout(() => router.push('/404'), 3000)
      }
    } else {
      showError("L'événement demandé n'a pas été trouvé.")
      setTimeout(() => router.push('/404'), 3000)
      console.log(error)
    }
  } finally {
    isLoading.value = false
  }
})


// Computed pour le style du thème
const themeStyle = computed(() => {
  if (event.value) {
    return {
      backgroundColor: formData.value.eventColor || '#f9f9f9',
    }
  }
  return {}
})

// Fonction pour afficher la notification
function showNotification(message: string, type: 'success' | 'error') {
  notification.value = { message, type, visible: true }
  setTimeout(() => (notification.value.visible = false), 3000)
}

// Fonction pour rejoindre ou quitter un événement
async function toggleParticipation() {
  if (!event.value || !currentUserId.value) return

  isLoading.value = true

  const wasParticipant = event.value.participants.some((p) => p.userId === currentUserId.value)
  const wasParticipantInPending = event.value.participants.some((p) => p.userId === currentUserId.value && p.status === "pending")

  try {

    // Re-fetch event to get fresh data
    const updatedEvent = await getEventById(event.value.id)

    event.value = {
      ...updatedEvent,
      id: updatedEvent._id,
    }

    // Update attendanceConfirmed state based on new event data
    const participant = updatedEvent.participants.find(
      (p) => p.userId === currentUserId.value
    )
    if (participant) {
      if (participant.status === 'confirmed') {
        attendanceConfirmed.value = 'confirmed'
      } else if (participant.status === 'pending') {
        attendanceConfirmed.value = 'pending'
      } else {
        attendanceConfirmed.value = 'not_joined'
      }
    } else {
      attendanceConfirmed.value = 'not_joined'
    }


    let notifMessage = ""

    if (wasParticipantInPending) {
      notifMessage = 'Vous avez confirmer votre présence'
    } else if (wasParticipant) {
      notifMessage = 'Vous avez quitté l\'événement.'
    } else {
      notifMessage = 'Vous avez rejoint l\'événement.'
    }

    showNotification(notifMessage, 'success')
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la participation :', error)
    showNotification(error?.message || 'Une erreur est survenue. Veuillez réessayer.', 'error')
  } finally {
    isLoading.value = false
  }
}

const formattedDate = computed(() => formatDate(event.value?.date, 'DD/MM/YYYY'))


async function quitEvent() {
  if (!event.value) return


  const user = localStorage.getItem('outsider')

  if (user !== null) {
    const parsedUser = JSON.parse(user)

    console.log(parsedUser)
    await exitEventForOutsider(parsedUser.username, eventId).then(
      () => {
        router.push('/auth')
        localStorage.removeItem('outsider')
      }
    )
  }



  try{

  } catch (error) {
    console.error('Erreur lors de la mise à jour de la participation :', error)
    showNotification(error?.message || 'Une erreur est survenue. Veuillez réessayer.', 'error')
  } finally {
    isLoading.value = false
  }
}

</script>

<template>
  <div class="event-detail min-h-screen flex flex-col bg-gray-100">
    <NotificationComponent
      v-if="currentNotification.isVisible"
      :message="currentNotification.message"
      :type="currentNotification.type"
      :isVisible="currentNotification.isVisible"
    />
    <HeaderComponent />

    <main class="container-card h-screen overflow-auto mx-auto max-w-4xl p-4">
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
        <svg
          class="animate-spin h-10 w-10 text-blue-500 mb-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          ></path>
        </svg>
        <p class="text-gray-500">Chargement...</p>
      </div>

      <div v-else-if="event" class="w-full max-w-4xl bg-white shadow-lg rounded-lg overflow-hidden">
        <div class="relative flex items-center justify-center h-72 sm:h-96" :style="themeStyle">
          <img
            :src="
              event.image ??
              'https://afterworkly-media.s3.eu-north-1.amazonaws.com/logo-afterworkly.png'
            "
            alt="Image de l'événement"
            class="absolute w-4/6 h-auto object-contain rounded-lg"
          />
          <button
            v-if="showEditButtons"
            @click="showImageModal = true"
            class="absolute bottom-4 right-4 text-gray-700 hover:text-gray-900 transition"
            title="Changer l'image"
          >
            <i class="fas fa-camera text-2xl"></i>
          </button>
          <button
            v-if="showEditButtons"
            class="absolute bottom-4 right-12 text-gray-700 hover:text-gray-900 transition"
            title="Changer la couleur du thème"
          >
            <input
              type="color"
              v-model="formData.eventColor"
              class="w-8 h-8 border rounded-lg cursor-pointer"
            />
          </button>
        </div>

        <div class="p-6 space-y-6">
          <div class="flex justify-center items-center space-x-4 text-gray-600 mt-2">
            <p class="flex items-center space-x-2">
              🌐 <span class="ml-1 font-medium">{{ event.isPublic ? 'Public' : 'Privé' }}</span>
            </p>
          </div>
          <div class="text-center">
            <h2 class="text-2xl font-bold text-gray-800">{{ event.title }}</h2>
            <h3 class="text-2xl font-bold text-gray-800">📍{{ event.location }}</h3>
            <div class="flex justify-center items-center space-x-4 text-gray-600 mt-2">
              <p class="flex items-center space-x-2">
                <i class="fas fa-calendar-alt"></i>
                <span class="font-medium">{{ formattedDate }}</span>
              </p>
              <p class="flex items-center space-x-2">
                <i class="fas fa-clock"></i>
                <span class="font-medium">{{ event.time }}</span>
              </p>
            </div>
            <p class="text-gray-700 mt-4">{{ event.description }}</p>
          </div>

          <div class="text-center mt-6">
            <div class="space-x-4">
              <button
                class="px-4 py-2 rounded-lg font-semibold transition bg-red-500 text-white hover:bg-red-600"
                :disabled="isLoading"
                @click="showQuitModal = true"
              >
                Quitter
              </button>
            </div>
          </div>
          <div v-if="event.participants && event.participants.length > 0">
            <h3 class="font-semibold text-gray-800">Participants</h3>
            <div style="width: 100%; overflow: hidden; position: relative">
              <!-- Sliding Container -->
              <div
                ref="scrollContainer"
                class="space-y-2 scroll-div"
                style="
                  display: flex;
                  justify-content: flex-start;
                  align-items: center;
                  gap: 10px;
                  flex-wrap: nowrap;
                  overflow-x: auto;
                  scroll-behavior: smooth;
                  padding: 10px 0;
                  min-height: 90px;
                "
              >
                <div
                  v-for="participant in event.participants"
                  :key="participant.userId"
                  class="flex items-center flex-shrink-0"
                  style="width: 80px; margin: 0;"
                >
                  <ParticipantListComponent
                    :participantInfos="participant"
                    confirmed-class="text-green-600 font-bold"
                    undecided-class="text-yellow-500 italic"
                    :eventId="eventId"
                    :isCreator="false"
                  />
                </div>
              </div>

              <!-- Left Button -->
              <button
                @click="scrollLeft"
                style="
                  position: absolute;
                  left: -10px;
                  top: 50%;
                  transform: translateY(-50%);
                  background-color: rgba(195, 192, 192, 0.5);
                  border: none;
                  padding: 10px;
                  border-radius: 50%;
                  cursor: pointer;
                  z-index: 2;
                "
              >
                ⟨
              </button>

              <!-- Right Button -->
              <button
                @click="scrollRight"
                style="
                  position: absolute;
                  right: -10px;
                  top: 50%;
                  transform: translateY(-50%);
                  background-color: rgba(195, 192, 192, 0.5);
                  border: none;
                  padding: 10px;
                  border-radius: 50%;
                  cursor: pointer;
                  z-index: 2;
                "
              >
                〉
              </button>
            </div>
          </div>
        </div>

      </div>


      <NotificationComponent
        class="event-notification"
        v-if="notification.visible"
        :message="notification.message"
        :type="notification.type"
      />
    </main>

    <FooterComponent />

    <ModalComponent
      v-if="showQuitModal"
      :isVisible="showQuitModal"
      title="Êtes-vous sûr de vouloir quitter l'événement ?"
      title-class="text-center"
      :buttons="[
        {
          text: 'Annuler',
          action: () => (showQuitModal = false),
          class: 'bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 mt-2',
        },
        {
          text: 'Quitter',
          action: quitEvent,
          class: 'bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 mt-2',
        },
      ]"
    >
      <div class="text-center">
        <p class="text-gray-700">Cette action est irréversible.</p>
      </div>
    </ModalComponent>
  </div>
</template>

<style src="./EventDetailOutsiderPage.css" scoped></style>
