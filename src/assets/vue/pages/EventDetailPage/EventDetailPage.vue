<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { formatDate } from '@/utils/date'
import { getEventById, toggleParticipantStatus, deleteEvent, updateEvent, sendInviataionEmail, generateJoinLink, getEventMemories, createEventMemory, deleteMemory, updateMemory } from '@/axios/api'
import type { Event, Memory } from '@/assets/vue/types/types'
import { showError, currentNotification } from '../../../../utils/errors.ts'
import axios from 'axios'
import dayjs from 'dayjs'
import 'dayjs/locale/fr'
import { setupSocket } from '@/utils/socket.ts'
import { Swiper, SwiperSlide } from 'swiper/vue';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';




dayjs.locale('fr')

const route = useRoute()
const router = useRouter()
const event = ref<Event | null>(null)
const isLoading = ref(true)
const currentUserId = ref<string | null>(null)
const attendanceConfirmed = ref<'confirmed' | 'pending' | 'not_joined' >('not_joined')
const showEditButtons = ref(false)
const showInviteModal = ref(false)
const showImageModal = ref(false)
const inviteLink = ref<string | null>(null)
const inviteLinkExpiry = ref<Date | null>(null)
const isGeneratingLink = ref(false)
const emailToSend = ref<string>('')
const notification = ref<{ message: string; type: 'success' | 'error'; visible: boolean }>({
  message: '',
  type: 'success',
  visible: false,
})

const showMemory = ref<boolean>(false)
const swiperInstance = ref<SwiperType | null>(null)
const isBeginning = ref(true)
const isEnd = ref(false)
const memories = ref<Memory[]>([])
const isLoadingMemories = ref(false)

const fakeParticipants = [
  { userId: "user-1", username: "Alice", status: "confirmed", photo: "https://i.pravatar.cc/" },
  { userId: "user-2", username: "Bob", status: "pending", photo: "https://i.pravatar.cc/" },
  { userId: "user-3", username: "Charlie", status: "unknown", photo: "https://i.pravatar.cc" },
  { userId: "user-4", username: "Diana", status: "confirmed", photo: "https://i.pravatar.cc" },
  { userId: "user-5", username: "Ethan", status: "pending", photo: "https://i.pravatar.cc" },
  { userId: "user-6", username: "Fiona", status: "unknown", photo: "https://i.pravatar.cc" },
  { userId: "user-7", username: "George", status: "confirmed", photo: "https://i.pravatar.cc" },
  { userId: "user-26", username: "Zoe", status: "pending", photo: "https://i.pravatar.cc" },
  { userId: "user-27", username: "Alex", status: "unknown", photo: "https://i.pravatar.cc" },
  { userId: "user-28", username: "Bella", status: "confirmed", photo: "https://i.pravatar.cc" },
];

interface ExtendedParticipant {
  userId: string;
  username: string;
  status: 'confirmed' | 'pending' | string;
  photo?: string | null;
  bio?: string;
  availability?: string[];
  preferences?: any[];
  banner?: string;
  type : 'member' | 'outsider' | string;
}

const showParticipantModal = ref(false)
const selectedParticipant = ref<ExtendedParticipant | null>(null)

const formData = ref({
  eventName: '',
  eventDate: '',
  eventTime: '',
  deadlineDate: '',
  deadlineTime: '',
  eventLocation: '',
  eventImage: null as File | null,
  eventColor: '#f9f9f9',
  eventIsPublic: true,
  eventDescription: '',
  code: ''
})

const imagePreviewUrl = ref<string | null>(null)

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

// Variables pour la pop-up de suppréssion
const showDeleteModal = ref(false)
// Variables pour l'édition d'un event
const editEventMode = ref(false)

let socket: any = null

// Add socket event interfaces
interface EventUpdateData {
  eventId: string;
  redirect?: string;
  eventIsPublic?: string;
  eventTitle?: string;
  eventLocation?: string;
  eventDescription?: string;
  eventImage?: string;
  eventColor?: string;
  eventDate?: string;
  eventTime?: string;
  deadline?: string;
}

interface EventParticipantJoinData {
  eventId: string;
  participants: string;
}

interface EventDeleteData {
  eventId: string;
  redirectMessage: string;
}

interface UserProfileUpdateData {
  eventId: string;
  updatedUserData: {
    userId: string;
    username: string;
    photo: string;
    bio: string;
    availability: string[];
    preferences: any[];
    banner?: string;
  };
}

interface EventOutsiderJoinData {
  eventId: string;
}

onMounted(async () => {
  const eventId = route.params.id as string

  socket = setupSocket()

  socket.on('event-update', (updatedEventData: EventUpdateData) => {
    if (updatedEventData) {
      if (updatedEventData.eventId === eventId) {
        if (updatedEventData.redirect === 'true') {
          router.push('/')
        }

        event.value!.isPublic = updatedEventData.eventIsPublic === 'true'
        event.value!.title = updatedEventData.eventTitle || event.value!.title
        event.value!.location = updatedEventData.eventLocation || event.value!.location
        event.value!.description = updatedEventData.eventDescription || event.value!.description
        event.value!.image = updatedEventData.eventImage || event.value!.image
        event.value!.color = updatedEventData.eventColor || event.value!.color
        event.value!.date = updatedEventData.eventDate || event.value!.date
        event.value!.time = updatedEventData.eventTime || event.value!.time

        // Gestion de la deadline
        if (updatedEventData.deadline) {
          event.value!.deadline = updatedEventData.deadline
          // Parse et met à jour le form data - avoid timezone conversion
          const [datePart, timePart] = updatedEventData.deadline.replace('Z', '').split('T')
          formData.value.deadlineDate = datePart
          formData.value.deadlineTime = timePart.substring(0, 5) // Extract HH:MM from HH:MM:SS.000Z
        }

        formData.value.eventColor = updatedEventData.eventColor || event.value!.color
        event.value!.title = updatedEventData.eventTitle || event.value!.title
      }
    }
  })

  socket.on('event-participant-join', (eventData: EventParticipantJoinData) => {

    if (eventData && eventData.eventId === eventId) {
      if (event.value) {
        event.value!.participants = JSON.parse(eventData.participants)

        const participant = JSON.parse(eventData.participants).find(
          (p: any) => p.userId == currentUserId.value || p.outsiderId == currentUserId.value
        )


        const isCreator = event.value?.creator === currentUserId.value


        // Initialisation de l'état de participation
        if (participant) {
          if (participant.status === 'confirmed') {
            attendanceConfirmed.value = 'confirmed'
            console.log("confirmed");
          } else if (participant.status === 'pending') {
            attendanceConfirmed.value = 'pending'
            console.log("pending");
          } else {
            attendanceConfirmed.value = 'not_joined'
            console.log("not_joined");
          }
        } else {
          if (!event.value.isPublic && !isCreator) {
            router.push('/')
            return
          }
          attendanceConfirmed.value = 'not_joined'
          console.log("not_joined");
        }
      }
    }

  })

  socket.on('event-delete', (eventDeletedData: EventDeleteData) => {
    if (eventDeletedData) {
      if (eventDeletedData.eventId === eventId) {
        showNotification(eventDeletedData.redirectMessage, 'error')
        setTimeout(() => router.push('/'), 3000)
      }
    }
  })

  socket.on('memory-changed', (memoryData: { eventId: string, memories: Memory[] }) => {
    if (memoryData && memoryData.eventId && memoryData.memories) {
      if (memoryData.eventId === eventId) {

        // Force la réactivité en utilisant nextTick et en recréant le tableau
        nextTick(() => {
          memories.value = [...memoryData.memories]

          // Force la mise à jour du swiper après le changement des données
          updateSwiperAfterDataChange()
        })
      } else {
        console.log('EventId ne correspond pas')
      }
    } else {
      console.log('Données invalides reçues:', memoryData)
    }
  })

  socket.on('user-profile-update', (userData: UserProfileUpdateData) => {
    if (userData && userData.eventId === eventId && userData.updatedUserData) {
      if (event.value && event.value.participants) {
        const updatedParticipants = event.value.participants.map(participant => {
          if (participant.userId === userData.updatedUserData.userId) {
            const updatedParticipant = {
              ...participant,
              username: userData.updatedUserData.username,
              banner: userData.updatedUserData.banner,
              photo: userData.updatedUserData.photo,
              bio: userData.updatedUserData.bio,
              availability: userData.updatedUserData.availability,
              preferences: userData.updatedUserData.preferences
            }

            // Mis a jour pour la dialog avec les infos du user
            if (selectedParticipant.value && selectedParticipant.value.userId === userData.updatedUserData.userId) {
              selectedParticipant.value = updatedParticipant as ExtendedParticipant
            }

            return updatedParticipant
          }
          // Retourne le participant original si l'id ne correspond pas
          return participant
        })

        // Update tout l'objet event pour forcer la réactivité
        event.value = {
          ...event.value,
          participants: updatedParticipants
        }
      }
    }
})

  socket.on('event-outsider-join', async (eventOutsiderJoinData: EventOutsiderJoinData) => {
    if (eventOutsiderJoinData && eventOutsiderJoinData.eventId === eventId) {
      const updatedEvent = await getEventById(eventId)
      if (updatedEvent) {
        event.value = {
          ...updatedEvent,
          id: updatedEvent._id || updatedEvent.id
        }

        formData.value.eventName = updatedEvent.title
        formData.value.eventDate = updatedEvent.date
        formData.value.eventTime = updatedEvent.time
        formData.value.eventLocation = updatedEvent.location
        formData.value.eventDescription = updatedEvent.description
        formData.value.eventColor = updatedEvent.color || '#f9f9f9'
        formData.value.eventIsPublic = updatedEvent.isPublic
        formData.value.eventImage = updatedEvent.image ?? null

        // Gestion de la deadline
        if (updatedEvent.deadline) {
          const [datePart, timePart] = updatedEvent.deadline.split('T')
          formData.value.deadlineDate = datePart
          formData.value.deadlineTime = timePart.substring(0, 5) // Pour extract HH:MM
        } else {
          formData.value.deadlineDate = ''
          formData.value.deadlineTime = ''
        }

        const participant = updatedEvent.participants.find(
          (p) => p.type === 'member' ? p.userId === currentUserId.value : null
        )

        // Initialisation de l'état de participation
        if (participant) {
          if (participant.status === 'confirmed') {
            attendanceConfirmed.value = 'confirmed'
            console.log("confirmed");
          } else if (participant.status === 'pending') {
            attendanceConfirmed.value = 'pending'
            console.log("pending");
          } else {
            attendanceConfirmed.value = 'not_joined'
            console.log("not_joined");
          }
        } else {
          attendanceConfirmed.value = 'not_joined'
          console.log("not_joined");
        }
      }
    }
  })


  // todo : when creator kick out an outsider, should redirect him to login page

  // Écouter les événements de départ d'outsiders
  socket.on('event-outsider-quit', async (eventOutsiderQuitData: EventOutsiderJoinData) => {
    if (eventOutsiderQuitData && eventOutsiderQuitData.eventId === eventId) {
      const updatedEvent = await getEventById(eventId)
      if (updatedEvent) {
        event.value = {
          ...updatedEvent,
          id: updatedEvent._id || updatedEvent.id
        }

        formData.value.eventName = updatedEvent.title
        formData.value.eventDate = updatedEvent.date
        formData.value.eventTime = updatedEvent.time
        formData.value.eventLocation = updatedEvent.location
        formData.value.eventDescription = updatedEvent.description
        formData.value.eventColor = updatedEvent.color || '#f9f9f9'
        formData.value.eventIsPublic = updatedEvent.isPublic
        formData.value.eventImage = updatedEvent.image ?? null

        // Gestion de la deadline
        if (updatedEvent.deadline) {
          const [datePart, timePart] = updatedEvent.deadline.split('T')
          formData.value.deadlineDate = datePart
          formData.value.deadlineTime = timePart.substring(0, 5)
        } else {
          formData.value.deadlineDate = ''
          formData.value.deadlineTime = ''
        }

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
      }
    }
  })

  // Debug : Écouteur générique pour tous les événements socket
  // socket.onAny((eventName, ...args) => {
  //   if (eventName.includes('outsider')) {
  //     console.log('🔍 Socket événement reçu:', eventName, args)
  //   }
  // })

  // Récupérer l'utilisateur connecté depuis le localStorage
  const storedUser = localStorage.getItem('user')
  if (storedUser) {
    const user = JSON.parse(storedUser)
    currentUserId.value = user._id
  }

  try {
    isLoading.value = true
    const fetchedEvent = await getEventById(eventId)

    if (!fetchedEvent) {
      showError('Événement introuvable.')
      router.push('/404')
      return
    }

    event.value = {
      ...fetchedEvent,
      id: fetchedEvent._id,
    }

    // Charge les memsories de l'événement
    await fetchEventMemories(eventId || '')

    // Remplir formData
    formData.value.eventName = fetchedEvent.title
    formData.value.eventDate = fetchedEvent.date
    formData.value.eventTime = fetchedEvent.time

    if (fetchedEvent.deadline) {
      const [datePart, timePart] = fetchedEvent.deadline.split('T')
      formData.value.deadlineDate = datePart
      formData.value.deadlineTime = timePart.substring(0, 5) // Pour extract HH:MM
    } else {
      formData.value.deadlineDate = ''
      formData.value.deadlineTime = ''
    }

    formData.value.eventLocation = fetchedEvent.location
    formData.value.eventDescription = fetchedEvent.description
    formData.value.eventColor = fetchedEvent.color || '#f9f9f9'
    formData.value.eventIsPublic = fetchedEvent.isPublic
    formData.value.code = fetchedEvent.code

    // Gérer l'image
    formData.value.eventImage = fetchedEvent.image ?? null

    const participant = event.value?.participants.find(
      (p) => p.userId === currentUserId.value
    )

    // Initialisation de l'état de participation
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

const participationButtonStyle = computed(() => {
  if (attendanceConfirmed.value === 'confirmed') {
    return 'bg-red-500 text-white hover:bg-red-600'
  } else if (attendanceConfirmed.value === 'pending') {
    return 'bg-blue-500 text-white hover:bg-blue-600'
  } else {
    return 'bg-green-500 text-white hover:bg-green-600'
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

const isCurrentUserParticipant = computed(() => {
  if (!currentUserId.value || !event.value?.participants) return false
  return event.value.participants.some((participant: any) =>
    (participant.userId === currentUserId.value && participant.status === 'confirmed')
  )
})

const canAddMemories = computed(() => {
  if (!currentUserId.value || !event.value) return false
  return isCurrentUserParticipant.value || currentUserId.value === event.value.creator
})

const isRegistrationOpen = computed(() => {
  if (!event.value?.deadline) return true

  const now = new Date()
  const deadlineDateTime = new Date(event.value.deadline)
  return deadlineDateTime >= now
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
    if (!wasParticipant) {
      // User wants to join
      await toggleParticipantStatus(event.value.id, { isJoining: true, status: 'confirmed' });
    } else if (wasParticipantInPending) {
      // User confirms participation
      await toggleParticipantStatus(event.value.id, { isJoining: undefined, status: 'confirmed' });
    } else {
      // User quits
      await toggleParticipantStatus(event.value.id, { isJoining: false });
    }

    if (wasParticipant && !wasParticipantInPending && event.value.creator !== currentUserId.value && !event.value.isPublic) {
      router.push('/')
      return
    }
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

    // Gestion de l'erreur de deadline
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      const errorMessage = error.response.data.message
      if (errorMessage.includes('La date limite pour rejoindre cet événement est dépassée')) {
        showNotification('La période d\'inscription pour cet événement est terminée.', 'error')
        return
      }
      showNotification(errorMessage, 'error')
    } else {
      showNotification('Une erreur est survenue. Veuillez réessayer.', 'error')
    }
  } finally {
    isLoading.value = false
  }
}

function triggerEditEventMode() {
  editEventMode.value = true
  showEditButtons.value = true
}

function quitEditEventMode() {
  editEventMode.value = false
  showEditButtons.value = false
}

async function triggerSaveEvent() {
  if (!event.value) return

  // Validation de la date limite d'inscription
  if (formData.value.deadlineDate && formData.value.deadlineDate !== '') {
    const today = new Date()
    const eventDateTime = new Date(`${formData.value.eventDate}T${formData.value.eventTime}`)

    // Combine deadline date and time
    const deadlineTime = formData.value.deadlineTime || formData.value.eventTime
    const deadlineDateTime = new Date(`${formData.value.deadlineDate}T${deadlineTime}`)

    // Vérifier que la deadline n'est pas dans le passé
    if (deadlineDateTime < today) {
      showNotification('La date limite d\'inscription ne peut pas être dans le passé.', 'error')
      return
    }

    // Vérifier que la deadline n'est pas après la date de l'événement
    if (deadlineDateTime > eventDateTime) {
      showNotification('La date limite d\'inscription ne peut pas être postérieure à la date de l\'événement.', 'error')
      return
    }
  }

  isLoading.value = true

  const updatedEventData = new FormData()

  updatedEventData.append('title', formData.value.eventName)
  updatedEventData.append('date', formData.value.eventDate)
  updatedEventData.append('time', formData.value.eventTime)

  // Send combined deadline datetime
  if (formData.value.deadlineDate && formData.value.deadlineDate !== '') {
    const deadlineTime = formData.value.deadlineTime || formData.value.eventTime
    const deadline = `${formData.value.deadlineDate}T${deadlineTime}`
    updatedEventData.append('deadline', deadline)
  } else {
    const deadline = `${formData.value.eventDate}T${formData.value.eventTime}`
    updatedEventData.append('deadline', deadline)
  }

  updatedEventData.append('description', formData.value.eventDescription)
  updatedEventData.append('location', formData.value.eventLocation)
  updatedEventData.append('color', formData.value.eventColor)
  updatedEventData.append('isPublic', formData.value.eventIsPublic.toString())
  updatedEventData.append('code', formData.value.code)

  if (formData.value.eventImage) {
    updatedEventData.append('image', formData.value.eventImage)
  }

  try {
    await updateEvent(event.value.id, updatedEventData).then((response) => {
      if (event.value) {
        event.value.image = response.updatedEvent.image
          ? response.updatedEvent.image
          : 'https://afterworkly-media.s3.eu-north-1.amazonaws.com/logo-afterworkly.png'
      }
    })
    event.value.title = formData.value.eventName
    event.value.date = formData.value.eventDate
    event.value.time = formData.value.eventTime

    if (formData.value.deadlineDate) {
      const deadlineTime = formData.value.deadlineTime || formData.value.eventTime
      event.value.deadline = `${formData.value.deadlineDate}T${deadlineTime}`
    } else {
      event.value.deadline = undefined
    }

    event.value.description = formData.value.eventDescription
    event.value.location = formData.value.eventLocation
    event.value.isPublic = formData.value.eventIsPublic
    event.value.color = formData.value.eventColor

    editEventMode.value = false
    showEditButtons.value = false
    notification.value = {
      message: 'Événement sauvegardé avec succès !',
      type: 'success',
      visible: true,
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'événement :", error)
  } finally {
    isLoading.value = false
  }
}

async function triggerDeleteEvent() {
  //Essaie de suppression d'event
  try {
    // Appel de l'api de suppression de l'event
    await deleteEvent(route.params.id as string).then(() => {
      notification.value = {
        message: 'Événement supprimé avec succès !',
        type: 'success',
        visible: true,
      }
      router.push('/')
    })
  } catch (error) {
    // Echec de suppression d'event
    console.log(error)
    notification.value = {
      message: error.message || 'Une erreur est survenue.',
      type: 'error',
      visible: true,
    }
  }
}

// Fonction pour copier le lien d'invitation dans le presse-papiers
function copyInviteLink() {
  if (inviteLink.value) {
    navigator.clipboard.writeText(inviteLink.value).then(() => {
      showNotification("Lien d'invitation copié dans le presse-papiers.", 'success')
    })
  }
}

// Fonction pour envoyer un email d'invitation
async function sendInviteEmail(email: string) {
  try {
    if (event.value?.id) {
      await sendInviataionEmail(email, event.value.id).then(
        () => {
          showNotification(`Invitation envoyée à ${email}.`, 'success')
        }
      )
    }

  } catch (error) {
    console.error("Erreur lors de l'envoi de l'invitation :", error)
    showNotification("Échec de l'envoi de l'invitation.", 'error')
  }
}

function handleImageUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    formData.value.eventImage = file
    imagePreviewUrl.value = URL.createObjectURL(file)
  }
}

function uploadImage() {
  showImageModal.value = false
}

const formattedDate = computed(() => formatDate(event.value?.date, 'DD/MM/YYYY'))

function toggleMemory() {
  showMemory.value = !showMemory.value
}

onUnmounted(() => {
  if (socket) {
    socket.off('event-update')
    socket.off('event-participant-join')
    socket.off('event-delete')
    socket.off('event-outsider-join')
    socket.off('event-outsider-quit')
    socket.off('memory-changed')
    socket.off('memory-updated')
    socket.off('memory-deleted')
  }
})

async function quitFromPending() {
  if (!event.value || !currentUserId.value) return

  isLoading.value = true

  try {
    await toggleParticipantStatus(event.value.id, { isJoining: false }).then(
      async (response) => {
        if (response.redirect) {
          router.push('/')
          return
        } else {

          if (!event.value?.id) return
          // Re-fetch event to get fresh data
          const updatedEvent = await getEventById(event.value.id)
            event.value = {
            ...updatedEvent,
            id:  updatedEvent._id,
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
          showNotification('Vous avez quitté l\'événement.', 'success')
        }
      }
    )


  } catch (error) {
    console.error('Erreur lors de la mise à jour de la participation :', error)
    showNotification(error?.message || 'Une erreur est survenue. Veuillez réessayer.', 'error')
  } finally {
    isLoading.value = false
  }
}

function generateRandomCode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function generateNewJoinLink() {
  if (!event.value?.id) return

  isGeneratingLink.value = true
  try {
    const response = await generateJoinLink(event.value.id)
    inviteLink.value = response.link
    inviteLinkExpiry.value = new Date(response.expiresAt)
    showNotification('Lien généré avec succès !', 'success')
  } catch (error) {
    console.error('Erreur lors de la génération du lien :', error)
    showNotification('Échec de la génération du lien.', 'error')
  } finally {
    isGeneratingLink.value = false
  }
}

async function handleRemoveParticipant(userId: string, event: Event, username: string) {
  if (event) {
    event.participants =  event.participants.filter(p => p.userId !== userId && p.username !== username)
  }
}

function handleParticipantClick(participant: any) {
  selectedParticipant.value = participant
  showParticipantModal.value = true
}

function closeParticipantModal() {
  showParticipantModal.value = false
  selectedParticipant.value = null
}

function onSwiper(swiper: SwiperType) {
  swiperInstance.value = swiper;
  updateNavigationState();
}

function onSlideChange() {
  updateNavigationState();
}

function updateNavigationState() {
  if (swiperInstance.value) {
    isBeginning.value = swiperInstance.value.isBeginning;
    isEnd.value = swiperInstance.value.isEnd;
  }
}

function slidePrev() {
  if (swiperInstance.value) {
    swiperInstance.value.slidePrev();
  }
}

function slideNext() {
  if (swiperInstance.value) {
    swiperInstance.value.slideNext();
  }
}

async function fetchEventMemories(eventId: string) {
  try {
    isLoadingMemories.value = true
    if (eventId && eventId !== '') {
      const fetchedMemories = await getEventMemories(eventId)
      memories.value = fetchedMemories
    } else {
      console.error("Erreur lors de la récupération des souvenirs : Memory ID is empty or null")
      memories.value = []
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des souvenirs :", error)
    console.log(error)
    showNotification("Impossible de charger les souvenirs", 'error')
  } finally {
    isLoadingMemories.value = false
  }
}

const newMemoryText = ref('')
const newMemoryImage = ref<File | null>(null)
const newMemoryImagePreview = ref<string | null>(null)
const isSubmittingMemory = ref(false)

// Delete memory state
const showDeleteMemoryModal = ref(false)
const memoryToDelete = ref<string | null>(null)

function handleNewMemoryImageUpload(e: any) {
  const input = e.target as HTMLInputElement
  if (input && input.files && input.files.length > 0) {
    const file = input.files[0]
    newMemoryImage.value = file
    newMemoryImagePreview.value = URL.createObjectURL(file)
  }
}

function resetMemoryForm() {
  newMemoryText.value = ''
  newMemoryImage.value = null

  if (newMemoryImagePreview.value) {
    URL.revokeObjectURL(newMemoryImagePreview.value)
    newMemoryImagePreview.value = null
  }
}

async function submitNewMemory() {
  if (!newMemoryText.value || !newMemoryImage.value) {
    showNotification("L'image et le texte sont requis", 'error')
    return
  }

  try {
    isSubmittingMemory.value = true

    const formData = new FormData()
    formData.append('text', newMemoryText.value)
    formData.append('image', newMemoryImage.value)

    await createEventMemory(route.params.id as string, formData)

    await fetchEventMemories(route.params.id as string)

    // Forcer la mise à jour du Swiper après l'ajout d'un souvenir
    updateSwiperAfterDataChange()

    showNotification("Souvenir ajouté avec succès ! 📸", 'success')
    resetMemoryForm()
  } catch (error) {
    console.error("Erreur lors de l'ajout du souvenir:", error)
    showNotification("Impossible d'ajouter le souvenir", 'error')
  } finally {
    isSubmittingMemory.value = false
  }
}

function handleDeleteMemoryRequest(memoryId: string) {
  memoryToDelete.value = memoryId
  showDeleteMemoryModal.value = true
}

async function confirmDeleteMemory() {
  if (!memoryToDelete.value) return

  try {
    await deleteMemory(memoryToDelete.value)
    await fetchEventMemories(route.params.id as string)

    // Forcer la mise à jour du Swiper après la suppression d'un souvenir
    updateSwiperAfterDataChange()

    showNotification("Souvenir supprimé avec succès", 'success')
  } catch (error) {
    console.error("Erreur lors de la suppression du souvenir:", error)
    showNotification("Impossible de supprimer le souvenir", 'error')
  } finally {
    showDeleteMemoryModal.value = false
    memoryToDelete.value = null
  }
}

function cancelDeleteMemory() {
  showDeleteMemoryModal.value = false
  memoryToDelete.value = null
}

async function handleEditMemory(memoryId: string, text: string, image: File | null) {
  try {
    const formData = new FormData()
    formData.append('text', text)

    if (image) {
      formData.append('image', image)
    }

    await updateMemory(memoryId, formData)
    await fetchEventMemories(route.params.id as string)

    // Forcer la mise à jour du Swiper après la modification d'un souvenir
    updateSwiperAfterDataChange()

    showNotification("Souvenir modifié avec succès", 'success')
  } catch (error) {
    console.error("Erreur lors de la modification du souvenir:", error)
    showNotification("Impossible de modifier le souvenir", 'error')
  }
}

function updateSwiperAfterDataChange() {
  // Force la mise à jour du swiper après changement des données
  if (swiperInstance.value) {
    // Utilise nextTick pour attendre que Vue mette à jour le DOM
    nextTick(() => {
      // Force la mise à jour du swiper
      swiperInstance.value?.update()

      // Met à jour l'état des boutons de navigation du swiper (précédent/suivant)
      updateNavigationState()
    })
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

    <main class="flex-1 mx-auto w-full max-w-4xl px-2 sm:px-4 py-4">
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

      <div v-else-if="event && !showMemory" class="w-full bg-white shadow-lg rounded-lg overflow-hidden">
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
          <div>
            <button
              v-if="showEditButtons"
              @click="showDeleteModal = true"
              class="absolute top-4 right-16 text-gray-700 hover:text-gray-900 transition"
              title="Supprimer l'événement"
            >
              <i class="fas fa-trash text-2xl text-red-500"></i>
            </button>
            <button
              v-if="event.creator === currentUserId && showEditButtons == false"
              @click="triggerEditEventMode"
              class="absolute top-4 right-16 text-gray-700 hover:text-gray-900 transition"
              title="Modifier l'événement"
            >
              <i class="fas fa-pencil-alt text-2xl"></i>
            </button>
            <button
              v-if="event.creator === currentUserId"
              @click="showInviteModal = true"
              class="absolute top-4 right-4 text-gray-700 hover:text-gray-900 transition"
              title="Envoyer une invitation"
            >
              <i class="fas fa-envelope text-2xl"></i>
            </button>
            <button
              @click="toggleMemory()"
              class="absolute top-14 right-4 text-gray-700 hover:text-gray-900 transition"
              title="Voir les souvenirs de l'événement"
            >
              <div class="relative">
                <i class="fa-solid fa-images text-2xl"></i>
                <span v-if="memories.length > 0" class="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {{ memories.length > 9 ? '9+' : memories.length }}
                </span>
              </div>
            </button>
          </div>
        </div>

        <div v-if="!editEventMode" class="p-6 space-y-6">
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
              <p v-if="event.deadline" class="flex items-center space-x-2">
                <i class="fas fa-hourglass-half"></i>
                <span class="font-medium">Inscription jusqu'au {{ formatDate(event.deadline.split('T')[0], 'DD/MM/YYYY') }} à {{ event.deadline.split('T')[1] }}</span>
              </p>
            </div>
            <p class="text-gray-700 mt-4">{{ event.description }}</p>
          </div>

          <div class="text-center mt-6">
            <button
              :class="`px-4 py-2 rounded-lg font-semibold transition ${participationButtonStyle}`"
              :disabled="isLoading"
              @click="toggleParticipation"
              v-if="currentUserId !== event.creator && attendanceConfirmed !== 'pending' && isRegistrationOpen"
            >
              <template v-if="attendanceConfirmed === 'confirmed'">Quitter</template>
              <template v-else>Rejoindre</template>
            </button>
            <div v-if="currentUserId !== event.creator && attendanceConfirmed === 'pending'" class="space-x-4">
              <button
                class="px-4 py-2 rounded-lg font-semibold transition bg-green-500 text-white hover:bg-green-600"
                :disabled="isLoading"
                @click="toggleParticipation"
                v-if="isRegistrationOpen"
              >
                Confirmer ma présence
              </button>
              <button
                class="px-4 py-2 rounded-lg font-semibold transition bg-red-500 text-white hover:bg-red-600"
                :disabled="isLoading"
                @click="quitFromPending"
              >
                Quitter
              </button>
            </div>
            <div v-if="currentUserId !== event.creator && !isRegistrationOpen && attendanceConfirmed === 'not_joined'" class="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded-lg">
              <i class="fas fa-exclamation-triangle mr-2"></i>
              La période d'inscription est terminée
            </div>
          </div>
          <div v-if="event.participants && event.participants.length > 0">
            <h3 class="font-semibold text-gray-800">Participants</h3>
            <div style="width: 100%; overflow: hidden; position: relative; padding: 0 15%;" class="responsive-padding">
              <div class="faded-edges">
                <div
                  ref="scrollContainer"
                  class="space-y-2 scroll-div"
                  style="
                    display: flex;
                    justify-content: flex-start;
                    align-items: center;
                    gap: 4%;
                    flex-wrap: nowrap;
                    overflow-x: auto;
                    scroll-behavior: smooth;
                    min-height: 90px;
                    width: 100%;
                    padding: 0% 0% 0% 4%
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
                      :eventId="event.id"
                      :isCreator="event.creator === currentUserId"
                      @participantRemoved="(id) => handleRemoveParticipant(id, event, participant.username)"
                      @participantClicked="handleParticipantClick"
                    />
                  </div>
                </div>
              </div>

              <button
                @click="scrollLeft"
                style="
                  position: absolute;
                  left: 10px;
                  top: 50%;
                  transform: translateY(-50%);
                  width: 40px;
                  height: 40px;
                  background-color: rgba(195, 192, 192, 0.5);
                  border: none;
                  border-radius: 50%;
                  cursor: pointer;
                  z-index: 2;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                "
              >
                <i class="fa-solid fa-chevron-left" style="font-size: 16px; color: #333;"></i>
              </button>

              <button
                @click="scrollRight"
                style="
                  position: absolute;
                  right: 10px;
                  top: 50%;
                  transform: translateY(-50%);
                  width: 40px;
                  height: 40px;
                  background-color: rgba(195, 192, 192, 0.5);
                  border: none;
                  border-radius: 50%;
                  cursor: pointer;
                  z-index: 2;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                "
              >
                <i class="fa-solid fa-chevron-right" style="font-size: 16px; color: #333;"></i>
              </button>
            </div>

          </div>
        </div>

        <div v-if="editEventMode" class="p-6 space-y-6">
          <div class="flex items-center space-x-2">
            <label class="text-gray-700 font-medium">Public</label>
            <input type="checkbox" v-model="formData.eventIsPublic" class="rounded-md" />
            <span>{{ formData.eventIsPublic ? 'Public' : 'Privé' }}</span>
          </div>

          <div>
            <label class="block text-gray-700 font-medium">Titre</label>
            <input
              type="text"
              v-model="formData.eventName"
              class="w-full border rounded-lg p-3 mt-1 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label class="block text-gray-700 font-medium">Lieu</label>
            <input
              type="text"
              v-model="formData.eventLocation"
              class="w-full border rounded-lg p-3 mt-1 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-gray-700 font-medium">Date</label>
              <input
                type="date"
                v-model="formData.eventDate"
                class="w-full border rounded-lg p-3 mt-1 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label class="block text-gray-700 font-medium">Heure</label>
              <input
                type="time"
                v-model="formData.eventTime"
                class="w-full border rounded-lg p-3 mt-1 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-gray-700 font-medium">Date limite d'inscription</label>
              <input
                type="date"
                v-model="formData.deadlineDate"
                class="w-full border rounded-lg p-3 mt-1 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label class="block text-gray-700 font-medium">Heure limite d'inscription</label>
              <input
                type="time"
                v-model="formData.deadlineTime"
                class="w-full border rounded-lg p-3 mt-1 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label class="block text-gray-700 font-medium">Description</label>
            <textarea
              v-model="formData.eventDescription"
              class="border p-2 rounded w-full"
            ></textarea>
          </div>
          <div v-if="event.creator === currentUserId">
            <label class="block text-gray-700 font-medium">Code</label>
            <input disabled
              v-model="formData.code"
              class="border p-2 rounded w-full"
            />
          </div>
          <button
            type="button"
            class="px-3 py-1 bg-blue-500 text-white rounded"
            @click="formData.code = generateRandomCode()"
          >
            Régénérer le code
          </button>

          <div class="flex justify-end space-x-4">
            <button
              @click="quitEditEventMode"
              class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 mt-2"
            >
              Annuler
            </button>
            <button
              @click="triggerSaveEvent"
              class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mt-2"
            >
              Sauvegarder
            </button>
          </div>
        </div>
      </div>

      <div v-else-if="showMemory">
        <div class="w-full px-12 relative flex items-center justify-center h-[32rem] sm:h-[40rem] p-8" :style="themeStyle">
          <button
            @click="toggleMemory()"
            class="absolute top-4 right-4 text-gray-700 hover:text-gray-900 transition"
            title="Retour aux détails de l'événement"
          >
            <i class="fa-solid fa-circle-info text-2xl"></i>
          </button>

          <!-- Chevron gauche -->
          <button
            @click="slidePrev"
            class="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-gray-200 hover:bg-gray-300 rounded-full shadow transition-all duration-200 hover:scale-110 w-10 h-10 flex items-center justify-center"
            :disabled="isBeginning"
            :class="{ 'opacity-50 cursor-not-allowed': isBeginning }"
          >
            <i class="fa-solid fa-chevron-left text-gray-700 text-base leading-none"></i>
          </button>

          <!-- Chevron droit -->
          <button
            @click="slideNext"
            class="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-gray-200 hover:bg-gray-300 rounded-full shadow transition-all duration-200 hover:scale-110 w-10 h-10 flex items-center justify-center"
            :disabled="isEnd"
            :class="{ 'opacity-50 cursor-not-allowed': isEnd }"
          >
            <i class="fa-solid fa-chevron-right text-gray-700 text-base leading-none"></i>
          </button>

          <swiper
            class="w-full h-full px-18"
            :slides-per-view="1"
            :space-between="20"
            :auto-height="true"
            :height="300"
            :breakpoints="{
              640: {
                slidesPerView: 1,
                spaceBetween: 20,
              },
              768: {
                slidesPerView: 2,
                spaceBetween: 30,
              },
              1024: {
                slidesPerView: 2,
                spaceBetween: 30,
              }
            }"
            @swiper="onSwiper"
            @slideChange="onSlideChange"
          >
            <swiper-slide v-if="canAddMemories" class="h-auto py-4">
              <div class="memory-card w-full h-auto min-h-[400px] flex flex-col p-4 bg-white rounded-lg shadow-md">
                <h3 class="text-lg font-semibold text-gray-800 mb-3">Ajouter un souvenir</h3>

                <div class="flex-1 space-y-4">
                  <div>
                    <label class="block text-gray-700 font-medium mb-2">Description</label>
                    <textarea
                      v-model="newMemoryText"
                      class="w-full border rounded-lg p-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                      placeholder="Décrivez ce souvenir..."
                      rows="3"
                      style="max-height: 100px; overflow-y: auto;"
                    ></textarea>
                  </div>

                  <div>
                    <label class="block text-gray-700 font-medium mb-2">Image</label>

                    <!-- Image upload section when no image -->
                    <div v-if="!newMemoryImagePreview">
                      <label
                        class="block w-full border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors min-h-[120px]"
                        for="memory-image-upload"
                      >
                        <i class="fas fa-camera text-2xl text-gray-400 mb-2"></i>
                        <p class="text-gray-500 text-sm text-center">Cliquez pour ajouter une image</p>
                        <input
                          type="file"
                          accept="image/*"
                          class="hidden"
                          @change="handleNewMemoryImageUpload"
                          id="memory-image-upload"
                        />
                      </label>
                    </div>

                    <!-- Section d'aperçu de l'image lorsqu'une image est sélectionnée -->
                    <div v-else class="space-y-3">
                      <div class="relative w-full">
                        <div class="w-full h-40 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden">
                          <img
                            :src="newMemoryImagePreview"
                            class="w-full h-full object-cover relative memory-preview"
                            alt="Aperçu de l'image"
                          />
                        </div>
                        <button
                          @click="resetMemoryForm()"
                          class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md hover:bg-red-600 transition-colors text-xs"
                          title="Supprimer l'image"
                        >
                          <i class="fas fa-times"></i>
                        </button>
                      </div>
                      <p class="text-xs text-gray-500 text-center">Image sélectionnée</p>
                    </div>
                  </div>
                </div>

                <div class="mt-4 pt-4 border-t border-gray-100">
                  <button
                    @click="submitNewMemory"
                    class="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    :disabled="isSubmittingMemory || !newMemoryText || !newMemoryImage"
                  >
                    <span v-if="isSubmittingMemory">
                      <i class="fas fa-spinner fa-spin mr-1"></i> Envoi...
                    </span>
                    <span v-else>Enregistrer</span>
                  </button>
                </div>
              </div>
            </swiper-slide>

            <swiper-slide v-for="memory in memories" :key="memory._id" class="h-auto py-4">
              <MemoryComponentCard
                :text="memory.text"
                :image="memory.image"
                :memoryId="memory._id"
                :issuedBy="memory.issuedBy.userId"
                :issuedByUsername="memory.issuedBy.username"
                :currentUserId="currentUserId || ''"
                :createdAt="memory.createdAt"
                @deleteMemory="handleDeleteMemoryRequest"
                @editMemory="handleEditMemory"
              />
            </swiper-slide>

            <swiper-slide v-if="!isLoadingMemories && memories.length === 0 && !canAddMemories" class="h-auto py-4">
              <div class="memory-card w-full h-auto min-h-[400px] flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-md text-center">
                <div class="mb-6">
                  <i class="fas fa-camera text-6xl text-gray-300 mb-4"></i>
                  <h3 class="text-xl font-semibold text-gray-600 mb-2">Aucun souvenir pour le moment</h3>
                  <p class="text-gray-500 text-sm max-w-sm">
                    Les souvenirs de cet événement apparaîtront ici une fois que les participants commenceront à les partager.
                  </p>
                </div>
                <div class="text-xs text-gray-400 bg-gray-50 px-4 py-2 rounded-lg">
                  💡 Seuls les participants confirmés peuvent ajouter des souvenirs
                </div>
              </div>
            </swiper-slide>

            <div v-if="isLoadingMemories" class="flex justify-center items-center w-full h-32">
              <div class="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
            </div>
          </swiper>
        </div>
      </div>
      <!-- Modal d'invitation aux événements  -->
      <ModalComponent
        v-if="showInviteModal"
        :isVisible="showInviteModal"
        title="Inviter des participants"
        :buttons="[
          {
            text: 'Fermer',
            action: () => (showInviteModal = false),
            class: 'bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 mt-2',
          },
        ]"
      >
        <div class="space-y-6">
          <!-- Section Generation de lien  -->
          <div class="bg-gray-50 p-4 rounded-lg">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-800">Lien d'invitation</h3>
              <button
                @click="generateNewJoinLink"
                :disabled="isGeneratingLink"
                class="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
              >
                <i class="fas fa-link"></i>
                <span>{{ isGeneratingLink ? 'Génération...' : 'Générer un lien' }}</span>
              </button>
            </div>

            <div v-if="inviteLink" class="space-y-2">
              <div class="flex items-center space-x-2 bg-white p-2 rounded border">
                <code class="flex-1 text-sm break-all">{{ inviteLink }}</code>
                <button
                  @click="copyInviteLink"
                  class="text-blue-500 hover:text-blue-600 transition"
                  title="Copier le lien"
                >
                  <i class="fas fa-copy"></i>
                </button>
              </div>
              <p v-if="inviteLinkExpiry" class="text-sm text-gray-500">
                Expire le {{ new Date(inviteLinkExpiry).toLocaleString() }}
              </p>
            </div>
            <p v-else class="text-gray-500 text-sm">
              Cliquez sur "Générer un lien" pour créer un lien d'invitation
            </p>
          </div>

          <!-- Section Invitation Email -->
          <div class="border-t pt-4">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Inviter par email</h3>
            <div class="space-y-4">
              <div>
                <label for="email" class="block text-gray-700 mb-2">Adresse email :</label>
                <input
                  id="email"
                  type="email"
                  v-model="emailToSend"
                  class="border p-2 rounded w-full"
                  placeholder="Saisissez une adresse email"
                />
              </div>
              <button
                @click="sendInviteEmail(emailToSend)"
                class="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
              >
                Envoyer l'invitation
              </button>
            </div>
          </div>
        </div>
      </ModalComponent>

      <ModalComponent
        v-if="showDeleteModal"
        :isVisible="showDeleteModal"
        title="Voulez-vous vraiment supprimer cet événement ?"
        :buttons="[
          {
            text: 'Oui',
            action: triggerDeleteEvent,
            class: 'bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mt-2',
          },
          {
            text: 'Non',
            action: () => (showDeleteModal = false),
            class: 'bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 mt-2',
          },
        ]"
      >
      </ModalComponent>

      <ModalComponent
        v-if="showDeleteMemoryModal"
        :isVisible="showDeleteMemoryModal"
        title="Êtes-vous sûr de vouloir retirer le souvenir ?"
        :buttons="[
          {
            text: 'Oui',
            action: confirmDeleteMemory,
            class: 'bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 mt-2',
          },
          {
            text: 'Non',
            action: cancelDeleteMemory,
            class: 'bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 mt-2',
          },
        ]"
      >
      </ModalComponent>

      <div
        v-if="showImageModal"
        class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
        style="z-index: 9999"
      >
        <div class="bg-white p-6 rounded-lg shadow-lg max-w-md w-full" style="z-index: 10000">
          <h2 class="text-lg font-bold mb-4">Changer l'image</h2>
          <input type="file" @change="handleImageUpload" class="mb-4 w-full" />
          <img :src="imagePreviewUrl ?? event?.image ?? 'fallback.jpg'" style="width: 100px" />
          <div class="flex justify-end space-x-2">
            <button
              @click="showImageModal = false"
              class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 mt-2"
            >
              Annuler
            </button>
            <button
              @click="uploadImage"
              class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mt-2"
            >
              Sauvegarder
            </button>
          </div>
        </div>
      </div>

      <NotificationComponent
        class="event-notification"
        v-if="notification.visible"
        :message="notification.message"
        :type="notification.type"
      />

      <ParticipantProfileModal
        :isVisible="showParticipantModal"
        :participant="selectedParticipant"
        @close="closeParticipantModal"
      />
    </main>

    <FooterComponent />
  </div>
</template>
<style src="./EventDetailPage.css" scoped></style>
