<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { formatDate } from '@/utils/date';
import { getEventById, toggleParticipantStatus, deleteEvent } from '@/axios/api';
import type { Event } from '@/assets/vue/types/types';
import { showError, currentNotification } from '../../../../utils/errors.ts';
import axios from 'axios';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';

dayjs.locale('fr');

const route = useRoute();
const router = useRouter();
const event = ref<Event | null>(null);
const isLoading = ref(true);
const currentUserId = ref<string | null>(null);
const attendanceConfirmed = ref(false);
const showDeleteButton = ref(false);

const showInviteModal = ref(false);
const inviteLink = ref<string | null>(null);
const emailToSend = ref<string>('');
const notification = ref<{ message: string; type: 'success' | 'error'; visible: boolean }>({
  message: '',
  type: 'success',
  visible: false,
});
const showDeleteModal = ref(false);
const scrollContainer = ref<HTMLDivElement | null>(null);

function scrollLeft() {
  if (scrollContainer.value) {
    scrollContainer.value.scrollLeft -= 200; // Scroll by 200px to the left
  }
}

function scrollRight() {
  if (scrollContainer.value) {
    scrollContainer.value.scrollLeft += 200; // Scroll by 200px to the right
  }
}



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

    if (!fetchedEvent) {
      showError('Événement introuvable.');
      router.push('/404');
      return;
    }

    event.value = {
      ...fetchedEvent,
      id: fetchedEvent._id, // todo see about this
    };

    // Créer un lien d'invitation
    inviteLink.value = `${window.location.origin}/event-detail/${eventId}?invitation=true`;

    // Initialisation de l'état de participation
    attendanceConfirmed.value = event.value?.participants.some(
      (participant) => participant.userId === currentUserId.value
    ) ?? false;

  } catch (error) {
    console.error("Erreur lors de la récupération de l'événement :", error);
    if (axios.isAxiosError(error)) {
      if (error.response && error.response.status === 404) {
        showError("L'événement demandé n'a pas été trouvé.");
        setTimeout(() => router.push('/404'), 3000);
      } else {
        showError(error.response?.data.message || "L'événement demandé n'a pas été trouvé.");
        setTimeout(() => router.push('/404'), 3000);
      }
    } else {
      showError("L'événement demandé n'a pas été trouvé.");
      setTimeout(() => router.push('/404'), 3000);
    }
  } finally {
    isLoading.value = false;
  }
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

  const isParticipant = event.value.participants.some(
    (p) => p.userId === currentUserId.value
  );

  try {
    await toggleParticipantStatus(event.value.id, {
      userId: currentUserId.value,
      isJoining: !isParticipant
    });

    // Re-fetch event to get fresh data
    const updatedEvent = await getEventById(event.value.id);
    event.value = {
      ...updatedEvent,
      id: updatedEvent._id,
    };

    attendanceConfirmed.value = !isParticipant;

    showNotification(
      `Vous avez ${!isParticipant ? 'rejoint' : 'quitté'} l'événement.`,
      'success'
    );
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la participation :', error);
    showNotification(
      error?.message || 'Une erreur est survenue. Veuillez réessayer.',
      'error'
    );
  }
}


function triggerSaveEvent() {
  try{
    //Appel de l'api de sauvegarde de l'event
    // await deleteEvent(route.params.id).then(
    //  resp  => {
    //     console.log('event deleted');
    //     notification.value = {
    //       message: 'Événement supprimé avec succès !',
    //       type: 'success',
    //       isVisible: true,
    //     };
    //     router.push("/");
    //    }
    // )
    showDeleteButton.value = false;
    notification.value = {
      message: 'Événement sauvegardé avec succès !',
      type: 'success',
      isVisible: true,
    };
    console.log('event saved');

  }
  //Echec de sauvegarde d'event
  catch (error) {
    console.log(error);
    notification.value = {
      message: error.message || 'Une erreur est survenue.',
      type: 'error',
      isVisible: true,
    };
  }
}

async function triggerDeleteEvent() {
  //Essaie de suppression d'event
  try {
    // Appel de l'api de suppression de l'event
    await deleteEvent(route.params.id).then(() => {
      notification.value = {
        message: 'Événement supprimé avec succès !',
        type: 'success',
        isVisible: true,
      };
      router.push('/');
    });
  }
  // Echec de suppression d'event
  catch (error) {
    console.log(error);
    notification.value = {
      message: error.message || 'Une erreur est survenue.',
      type: 'error',
      isVisible: true,
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

const formattedDate = computed(() => formatDate(event.value?.date, 'DD/MM/YYYY'));

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

    <main class="container mx-auto p-4 flex-grow flex justify-center items-center">
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
          <div>
            <button
              v-if="showDeleteButton"
              @click="showDeleteModal = true"
              class="absolute top-4 right-4 text-gray-700 hover:text-gray-900 transition"
              title="Supprimer l'événement"
            >
              <i class="fas fa-trash text-2xl text-red-500"></i>
            </button>
            <button
              v-if="event.creator === currentUserId"
              @click="showDeleteButton = true"
              class="absolute top-4 right-16 text-gray-700 hover:text-gray-900 transition"
              title="Modifier l'événement"
            >
              <i class="fas fa-pencil-alt text-2xl"></i>
            </button>
            <button
              v-if="event.creator === currentUserId && showDeleteButton == false"
              @click="showInviteModal = true"
              class="absolute top-4 right-4 text-gray-700 hover:text-gray-900 transition"
              title="Envoyer une invitation"
            >
              <i class="fas fa-envelope text-2xl"></i>
            </button>
            <button
              v-if="showDeleteButton"
              @click="triggerSaveEvent"
              class="absolute bottom-4 right-4 text-gray-700 hover:text-gray-900 transition"
              title="Modifier l'événement"
            >
              <i class="fas fa-save text-2xl"></i>
            </button>
          </div>
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


      <!-- Modal d'invitation aux événements  -->
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
