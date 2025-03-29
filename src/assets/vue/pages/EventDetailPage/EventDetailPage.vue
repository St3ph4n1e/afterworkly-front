<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { formatDate } from '@/utils/date'
import { getEventById, toggleParticipantStatus } from'@/axios/api';
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

// Variables pour la pop-up d'invitation
const showInviteModal = ref(false);
const inviteLink = ref<string | null>(null);
const emailToSend = ref<string>('');
const notification = ref<{ message: string; type: 'success' | 'error'; visible: boolean }>({
  message: '',
  type: 'success',
  visible: false,
});


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

// Récupération de l'événement et initialisation
onMounted(async () => {
  const eventId = route.params.id as string;

  // Récupérer l'utilisateur connecté depuis le localStorage
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
      id: fetchedEvent._id, // Transformation de `_id` en `id`
    };

    // Créer un lien d'invitation
    inviteLink.value = `${window.location.origin}/event-detail/${eventId}?invitation=true`;

    // Initialisation de l'état de participation
    attendanceConfirmed.value = event.value?.participants.some(
  (participant) =>
    participant.userId === currentUserId.value && participant.status === 'Confirmé'
) ?? false;



  } catch (error: any) {
    console.error("Erreur lors de la récupération de l'événement :", error);
    errorMessage.value = "Impossible de charger l'événement.";
  } finally {
    isLoading.value = false;
  }


  console.log("Participants :", event.value?.participants);
console.log("Utilisateur connecté :", currentUserId.value);
console.log(
  "Participation confirmée :",
  event.value?.participants.some(
    (participant) =>
      participant.userId === currentUserId.value && participant.status === 'Confirmé'
  )
);

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

// Fonction pour aller à la page de modification
function goToEditPage() {
  if (event.value) {
    router.push(`/edit-event/${event.value.id}`);
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

const formattedDate = computed(() => formatDate(event.value?.date, 'DD/MM/YYYY'));

</script>

<template>
  <div class="event-detail min-h-screen flex flex-col bg-gray-100">
    <HeaderComponent />

    <main class="container mx-auto p-4 flex-grow flex justify-center items-center">
      <div v-if="isLoading" class="text-center">
        <p class="text-gray-500">Chargement...</p>
      </div>

      <div v-else-if="event" class="w-full max-w-4xl bg-white shadow-lg rounded-lg overflow-hidden">
        <div class="relative flex items-center justify-center h-72 sm:h-96" :style="themeStyle">
          <img
            :src="event.image ?? ''"
            alt="Image de l'événement"
            class="absolute w-4/6 h-auto object-contain rounded-lg"
          />
          <button
            v-if="event.creator === currentUserId"
            @click="goToEditPage"
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

        <div class="p-6 space-y-6">
          <div class="text-center">
            <h2 class="text-2xl font-bold text-gray-800">{{ event.title }}</h2>
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
      </div>

      <ModalComponent
        v-if="showInviteModal"
        :isVisible="showInviteModal"
        title="Inviter des participants"
        :buttons="[
          { text: 'Fermer', action: () => (showInviteModal = false), class: 'bg-gray-500 text-white' }
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
