<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { formatDate } from '@/utils/date';
import { getEventById, toggleParticipantStatus, deleteEvent, updateEvent } from '@/axios/api';
// import { getImageUrl } from '@/utils/url';
// import type { Event, EventParticipant } from '@/assets/vue/types/types';
import type { Event } from '@/assets/vue/types/types';
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
const showEditButtons = ref(false);
// Variables pour la pop-up d'invitation
const showInviteModal = ref(false);
const showImageModal = ref(false);
const inviteLink = ref<string | null>(null);
const emailToSend = ref<string>('');
const notification = ref<{ message: string; type: 'success' | 'error'; visible: boolean }>({
  message: '',
  type: 'success',
  visible: false,
});

const formData = ref({
  eventName: '',
  eventDate: '',
  eventTime: '',
  eventLocation: '',
  eventImage: null as File | null,
  eventColor: '#f9f9f9',
  eventIsPublic: true,
  eventDescription: ''
});
const imagePreviewUrl = ref<string | null>(null);


const scrollContainer = ref<HTMLDivElement | null>(null);

// Function to scroll left
function scrollLeft() {
  if (scrollContainer.value) {
    scrollContainer.value.scrollLeft -= 200; // Scroll by 200px to the left
  }
}

// Function to scroll right
function scrollRight() {
  if (scrollContainer.value) {
    scrollContainer.value.scrollLeft += 200; // Scroll by 200px to the right
  }
}

const mockParticipants = [
  { userId: 1, username: 'User 1', photo: 'https://afterworkly-media.s3.eu-north-1.amazonaws.com/profil_photo.jpg' },
  { userId: 2, username: 'User 2', photo: 'https://afterworkly-media.s3.eu-north-1.amazonaws.com/profil_photo.jpg' },
  { userId: 3, username: 'User 3', photo: 'https://afterworkly-media.s3.eu-north-1.amazonaws.com/profil_photo.jpg' },
  { userId: 3, username: 'User 3', photo: 'https://afterworkly-media.s3.eu-north-1.amazonaws.com/profil_photo.jpg' },
  { userId: 3, username: 'User 3', photo: 'https://afterworkly-media.s3.eu-north-1.amazonaws.com/profil_photo.jpg' },
  { userId: 3, username: 'User 3', photo: 'https://afterworkly-media.s3.eu-north-1.amazonaws.com/profil_photo.jpg' },
  { userId: 3, username: 'User 3', photo: 'https://afterworkly-media.s3.eu-north-1.amazonaws.com/profil_photo.jpg' },
  { userId: 3, username: 'User 3', photo: 'https://afterworkly-media.s3.eu-north-1.amazonaws.com/profil_photo.jpg' },
  { userId: 3, username: 'User 3', photo: 'https://afterworkly-media.s3.eu-north-1.amazonaws.com/profil_photo.jpg' },
  { userId: 3, username: 'User 3', photo: 'https://afterworkly-media.s3.eu-north-1.amazonaws.com/profil_photo.jpg' },
  { userId: 3, username: 'User 3', photo: 'https://afterworkly-media.s3.eu-north-1.amazonaws.com/profil_photo.jpg' },
  { userId: 3, username: 'User 3', photo: 'https://afterworkly-media.s3.eu-north-1.amazonaws.com/profil_photo.jpg' },
  { userId: 3, username: 'User 3', photo: 'https://afterworkly-media.s3.eu-north-1.amazonaws.com/profil_photo.jpg' },
  { userId: 3, username: 'User 3', photo: 'https://afterworkly-media.s3.eu-north-1.amazonaws.com/profil_photo.jpg' },
  { userId: 3, username: 'User 3', photo: 'https://afterworkly-media.s3.eu-north-1.amazonaws.com/profil_photo.jpg' },
  { userId: 3, username: 'User 3', photo: 'https://afterworkly-media.s3.eu-north-1.amazonaws.com/profil_photo.jpg' },
  { userId: 3, username: 'User 3', photo: 'https://afterworkly-media.s3.eu-north-1.amazonaws.com/profil_photo.jpg' },
  { userId: 3, username: 'User 3', photo: 'https://afterworkly-media.s3.eu-north-1.amazonaws.com/profil_photo.jpg' },
  { userId: 3, username: 'User 3', photo: 'https://afterworkly-media.s3.eu-north-1.amazonaws.com/profil_photo.jpg' },
  { userId: 3, username: 'User 4', photo: 'https://afterworkly-media.s3.eu-north-1.amazonaws.com/profil_photo.jpg' },
];
// Variables pour la pop-up de suppréssion
const showDeleteModal = ref(false);
// Variables pour l'édition d'un event
const editEventMode = ref(false);

// Récupération de l'événement et initialisation
onMounted(async () => {
  const eventId = route.params.id as string;

  // Set current user
  const storedUser = sessionStorage.getItem('user');
  if (storedUser) {
    const user = JSON.parse(storedUser);
    currentUserId.value = user._id;
  }

  try {
    isLoading.value = true;
    const fetchedEvent = await getEventById(eventId);
    event.value = {
      ...fetchedEvent,
      id: fetchedEvent._id,
    };

    // Populate formData
    formData.value.eventName = fetchedEvent.title;
    formData.value.eventDate = fetchedEvent.date;
    formData.value.eventTime = fetchedEvent.time;
    formData.value.eventLocation = fetchedEvent.location;
    formData.value.eventDescription = fetchedEvent.description;
    formData.value.eventColor = fetchedEvent.color || '#f9f9f9';
    formData.value.eventIsPublic = fetchedEvent.isPublic;

    // Handle image
    formData.value.eventImage = fetchedEvent.image ?? null;

    console.log(fetchedEvent)

    // Invitation link
    inviteLink.value = `${window.location.origin}/event-detail/${eventId}?invitation=true`;

    // Participation status
    attendanceConfirmed.value =
      fetchedEvent.participants.some(
        (participant) =>
          participant.userId === currentUserId.value &&
          participant.status === 'Confirmé'
      ) ?? false;
  } catch (error) {
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
      backgroundColor: formData.value.eventColor || '#f9f9f9',
    };
  }
  return {};
});

// Computed pour l'image de l'événement
/*const eventImage = computed(() => {
  return getImageUrl(event.value?.image || 'logo.png');
});*/

// Fonction pour afficher la notification
function showNotification(message: string, type: 'success' | 'error') {
  notification.value = { message, type, visible: true };
  setTimeout(() => (notification.value.visible = false), 3000);
}

// Fonction pour rejoindre ou quitter un événement
async function toggleParticipation() {

  if (!event.value || !currentUserId.value) return;
  try {
    const newStatus = attendanceConfirmed.value ? 'Indécis' : 'Confirmé';
    const response = await toggleParticipantStatus(event.value.id, {
      userId: currentUserId.value,
      status: newStatus,
    });



    // Mettre à jour l'état local après succès
    event.value.participants = response.updatedEvent.participants;
    attendanceConfirmed.value = newStatus === 'Confirmé';
    showNotification(`Vous avez ${newStatus === 'Confirmé' ? 'rejoint' : 'quitté'} l'événement.`, 'success');
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la participation :', error);
    showNotification('Une erreur est survenue. Veuillez réessayer.', 'error');
  }
}

function triggerEditEventMode() {
  editEventMode.value = true;
  showEditButtons.value = true;
}

function quitEditEventMode() {
  editEventMode.value = false;
  showEditButtons.value = false;
}

async function triggerSaveEvent() {
  if (!event.value) return;

  const updatedEventData = new FormData();

  updatedEventData.append('title', formData.value.eventName);
  updatedEventData.append('date', formData.value.eventDate);
  updatedEventData.append('time', formData.value.eventTime);
  updatedEventData.append('description', formData.value.eventDescription);
  updatedEventData.append('location', formData.value.eventLocation);
  updatedEventData.append('color', formData.value.eventColor);
  updatedEventData.append('isPublic', formData.value.eventIsPublic.toString());

  if (formData.value.eventImage) {
    updatedEventData.append('image', formData.value.eventImage);
  }

  try {
    await updateEvent(event.value.id, updatedEventData).then(
      response => {
        if (event.value) {
          console.log(response.updatedEvent.image)
          console.log(typeof formData.value.eventImage)
          event.value.image = response.updatedEvent.image
            ? response.updatedEvent.image
            : 'https://afterworkly-media.s3.eu-north-1.amazonaws.com/logo-afterworkly.png';
        }
      }
    );
    event.value.title = formData.value.eventName;
    event.value.date = formData.value.eventDate;
    event.value.time = formData.value.eventTime;
    event.value.description = formData.value.eventDescription;
    event.value.location = formData.value.eventLocation;

    event.value.isPublic = formData.value.eventIsPublic;
    event.value.color = formData.value.eventColor;

    editEventMode.value = false;
    showEditButtons.value = false;
    notification.value = {
      message: 'Événement sauvegardé avec succès !',
      type: 'success',
      visible: true,
    };
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'événement :", error);
  }
}

async function triggerDeleteEvent() {
  //Essaie de suppression d'event
  try{
    //Appel de l'api de suppression de l'event
    await deleteEvent(route.params.id).then(
     // eslint-disable-next-line @typescript-eslint/no-unused-vars
     resp  => {
        // console.log('event deleted');
        notification.value = {
          message: 'Événement supprimé avec succès !',
          type: 'success',
          visible: true,
        };
        router.push("/");
       }
    )

  }
  //Echec de suppression d'event
  catch (error) {
    console.log(error);
    notification.value = {
      message: error.message || 'Une erreur est survenue.',
      type: 'error',
      visible: true,
    };
  }
}



// Fonction pour copier le lien d'invitation dans le presse-papiers
function copyInviteLink() {
  if (inviteLink.value) {
    navigator.clipboard.writeText(inviteLink.value).then(() => {
      showNotification('Lien d’invitation copié dans le presse-papiers.', 'success');
    });
  }
}

// Fonction pour envoyer un email d'invitation
async function sendInviteEmail(email: string) {
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simule un délai
    showNotification(`Invitation envoyée à ${email}.`, 'success');
  } catch (error) {
    console.error('Erreur lors de l’envoi de l’invitation :', error);
    showNotification('Échec de l’envoi de l’invitation.', 'error');
  }
}

function handleImageUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    formData.value.eventImage = file;
    imagePreviewUrl.value = URL.createObjectURL(file);
  }
}

function uploadImage() {
  showImageModal.value = false;
}

const formattedDate = computed(() => formatDate(event.value?.date, 'DD/MM/YYYY'));

</script>

<template>
  <div class="event-detail min-h-screen flex flex-col bg-gray-100">
    <HeaderComponent />

    <main class="container-card h-screen overflow-auto mx-auto max-w-4xl p-4">
      <div v-if="isLoading" class="text-center">
        <p class="text-gray-500">Chargement...</p>
      </div>

      <div v-else-if="event" class="w-full max-w-4xl bg-white shadow-lg rounded-lg overflow-hidden">
        <div class="relative flex items-center justify-center h-72 sm:h-96" :style="themeStyle">
          <img
            :src="event.image ?? 'https://afterworkly-media.s3.eu-north-1.amazonaws.com/logo-afterworkly.png'"
            alt="Image de l'événement"
            class="absolute w-4/6 h-auto object-contain rounded-lg"
          />
          <button
            v-if="showEditButtons"
            @click="showImageModal = true"
            class="absolute bottom-4 right-4 text-gray-700 hover:text-gray-900 transition"
            title="Changer l'image">
            <i class="fas fa-camera text-2xl"></i>
          </button>
          <button
            v-if="showEditButtons"
            class="absolute bottom-4 right-12 text-gray-700 hover:text-gray-900 transition"
            title="Changer la couleur du thème">
            <input type="color" v-model="formData.eventColor" class="w-8 h-8 border rounded-lg cursor-pointer" />
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
          </div>
        </div>

        <div
          v-if="!editEventMode"
          class="p-6 space-y-6"
        >

          <div class="flex justify-center items-center space-x-4 text-gray-600 mt-2">
            <p class="flex items-center space-x-2">
              <i class="fas fa-globe"></i>
              <span class="font-medium">{{ event.isPublic ? 'Public' : 'Privé' }}</span>
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
            <button
              v-if="currentUserId !== event.creator"
              @click="toggleParticipation"
              :class="[
                'px-6 py-2 rounded-lg transition font-medium',
                attendanceConfirmed
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-blue-500 text-white hover:bg-blue-600',
              ]"
            >
              {{ attendanceConfirmed ? 'Quitter' : 'Rejoindre' }} l'événement
            </button>
          </div>
          <div>

            <h3 class="font-semibold text-gray-800">Participants</h3>
            <div style="width: 100%; overflow: hidden; position: relative;">
              <!-- Sliding Container -->
              <div
                ref="scrollContainer"
                class="space-y-2 scroll-div"
                style="display: flex; justify-content: flex-start; align-items: center; gap: 10px; flex-wrap: nowrap; overflow-x: auto; scroll-behavior: smooth;">


                <div
                  v-for="participant in event.participants"
                  :key="participant.userId"
                  class="flex items-center">
                  <ParticipantListComponent
                    style="flex-shrink: 0; width: 80px; margin: 0;"
                    :participantInfos="participant"
                    confirmed-class="text-green-600 font-bold"
                    undecided-class="text-yellow-500 italic"
                  />
                </div>
              </div>

              <!-- Left Button -->
              <button
                @click="scrollLeft"
                style="position: absolute; left: -10px; top: 50%; transform: translateY(-50%); background-color: rgba(195,192,192,0.5); border: none; padding: 10px; border-radius: 50%; cursor: pointer; z-index: 2;">
                ⟨
              </button>

              <!-- Right Button -->
              <button
                @click="scrollRight"
                style="position: absolute; right: -10px; top: 50%; transform: translateY(-50%); background-color: rgba(195,192,192,0.5); border: none; padding: 10px; border-radius: 50%; cursor: pointer; z-index: 2;">
                〉
              </button>
            </div>

          </div>
        </div>

        <div v-if="editEventMode" class="p-6 space-y-6">
          <div class="flex items-center space-x-2">
            <label class="text-gray-700 font-medium">Public</label>
            <input
              type="checkbox"
              v-model="formData.eventIsPublic"
              class="rounded-md"
            />
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
          <div>
            <label class="block text-gray-700 font-medium">Description</label>
            <textarea v-model="formData.eventDescription" class="border p-2 rounded w-full"></textarea>
          </div>

          <div class="flex justify-end space-x-4">
            <button @click="quitEditEventMode" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 mt-2">
              Annuler
            </button>
            <button @click="triggerSaveEvent" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mt-2">
              Sauvegarder
            </button>
          </div>
        </div>

      </div>


      <!-- Modal d'invitation aux événements  -->
      <ModalComponent
        v-if="showInviteModal"
        :isVisible="showInviteModal"
        title="Inviter des participants"
        :buttons="[
          { text: 'Fermer', action: () => (showInviteModal = false), class: 'bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 mt-2' }
        ]"
      >
        <div>
          <p class="mb-4">Lien d'invitation : <code class="bg-gray-200 p-1 rounded">{{ inviteLink }}</code></p>
          <button @click="copyInviteLink" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">Copier le lien</button>

          <div class="mt-4">
            <label for="email" class="block text-gray-700 mb-2">Envoyer une invitation par email :</label>
            <input
              id="email"
              type="email"
              v-model="emailToSend"
              class="border p-2 rounded w-full"
              placeholder="Saisissez une adresse email"
            />
            <button
              @click="sendInviteEmail(emailToSend)"
              class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mt-2"
            >
              Envoyer
            </button>
          </div>
        </div>
      </ModalComponent>

      <ModalComponent
        v-if="showDeleteModal"
        :isVisible="showDeleteModal"
        title="Voulez-vous vraiment supprimer cet événement ?"
        :buttons="[
          { text: 'Oui', action: triggerDeleteEvent, class: 'bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mt-2' },
          { text: 'Non', action: () => (showDeleteModal = false), class: 'bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 mt-2' }
        ]"
      >
      </ModalComponent>

      <div v-if="showImageModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50" style="z-index: 9999;">
        <div class="bg-white p-6 rounded-lg shadow-lg max-w-md w-full" style="z-index: 10000;">
          <h2 class="text-lg font-bold mb-4">Changer l'image</h2>
          <input type="file" @change="handleImageUpload" class="mb-4 w-full" />
          <img
            :src="imagePreviewUrl ?? event?.image ?? 'fallback.jpg'"
            style="width: 100px;"
          />
          <div class="flex justify-end space-x-2">
            <button @click="showImageModal = false" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 mt-2">Annuler</button>
            <button @click="uploadImage" class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mt-2">Sauvegarder</button>
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

  </div>
</template>
<style src="./EventDetailPage.css" scoped></style>
