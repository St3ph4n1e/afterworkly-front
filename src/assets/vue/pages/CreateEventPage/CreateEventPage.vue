<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { createEvent, getUsers } from '@/axios/api'
import { useRouter } from 'vue-router';
import axios from 'axios';
import { showError, showSuccess, currentNotification } from '../../../../utils/errors.ts';
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.min.css'

interface User {
  _id: string;
  username: string;
  photo?: string;
  availability?: string[];
}

interface AvailabilityCheck {
  unavailable: User[];
}

interface EventResponse {
  event: {
    _id: string;
    title: string;
    date: string;
    time: string;
    description: string;
    location: string;
    image?: string;
  }
}

const router = useRouter();
const imageInput = ref<HTMLInputElement | null>(null);

const formData = ref({
  eventName: '',
  eventDate: '',
  eventTime: '',
  eventLocation: '',
  eventImage: null as File | null,
  eventColor: '#ffffff',
  eventParticipants: [] as string[],
  isPublic: false, // Champ pour définir si l'événement est public ou privé
  code: '',
});

const selectedUsers = ref([])

watch(selectedUsers, (newVal) => {
  formData.value.eventParticipants = newVal.map((user: User) => user._id)
})


const userList = ref([])

const previewImage = ref<string | null>(null);
const showAddToCalendar = ref(false);

const notification = ref<{
  message: string;
  type: 'success' | 'error' | 'info';
  isVisible: boolean;
}>({
  message: '',
  type: 'info',
  isVisible: false,
});

const showModal = ref(false);
const createdEventId = ref<string | null>(null);

const createdEventData = ref({
  title: '',
  startDate: '',
  startTime: '',
  location: '',
  description: '',
  participants: [] as User[]
});

// Fonction pour obtenir le jour de la semaine
function getDayOfWeek(date: string): string {
  const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  return days[new Date(date).getDay()];
}

// Fonction pour vérifier la disponibilité des participants
function checkParticipantAvailability(eventDate: string, participants: User[]): AvailabilityCheck {
  const eventDay = getDayOfWeek(eventDate);
  const unavailableParticipants = participants.filter(participant => {
    return !participant.availability?.includes(eventDay);
  });

  return { unavailable: unavailableParticipants };
}

function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0] || null;
  formData.value.eventImage = file;

  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      previewImage.value = reader.result as string;
    };
    reader.readAsDataURL(file);
  } else {
    previewImage.value = null;
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

async function handleSubmit() {
  const date = new Date()

  if(formData.value.eventDate < date.toISOString().split('T')[0]) {
    showError("La date de l'événement ne peut pas être dans le passé.");
    return;
  }

  // Vérifier la disponibilité des participants
  const availabilityCheck = checkParticipantAvailability(formData.value.eventDate, selectedUsers.value);
  if (availabilityCheck.unavailable.length > 0) {
    const unavailableNames = availabilityCheck.unavailable.map(user => user.username).join(', ');
    showError(`Les participants suivants ne sont pas disponibles le ${getDayOfWeek(formData.value.eventDate)} : ${unavailableNames}`);
    return;
  }

  const eventData = new FormData();
  eventData.append('title', formData.value.eventName);
  eventData.append('date', formData.value.eventDate);
  eventData.append('time', formData.value.eventTime);
  eventData.append('location', formData.value.eventLocation);
  eventData.append('color', formData.value.eventColor);
  eventData.append('isPublic', formData.value.isPublic.toString());
  eventData.append('participants', JSON.stringify(formData.value.eventParticipants));
  eventData.append('code', formData.value.code);

  if (formData.value.eventImage) {
    eventData.append('image', formData.value.eventImage);
  }

  try {
    const response = await createEvent(eventData) as EventResponse;
    createdEventId.value = response.event._id;

    createdEventData.value = {
      title: response.event.title,
      startDate: response.event.date,
      startTime: response.event.time,
      location: response.event.location,
      description: response.event.description || "Participez à notre événement !",
      participants: []
    };

    // Afficher la notification de succès
    showSuccess("Événement créé avec succès !");
    resetForm();
    showModal.value = true;
  } catch (error) {
    if(axios.isAxiosError(error)) {
      showError(error.response?.data.message || 'Une erreur est survenue.');
    } else {
      showError((error as Error)?.message || 'Une erreur est survenue.');
  }
}
}


function resetForm() {
  formData.value = {
    eventName: '',
    eventDate: '',
    eventTime: '',
    eventLocation: '',
    eventImage: null,
    eventColor: '#ffffff',
    eventParticipants: [],
    isPublic: true,
    code: generateRandomCode()
  };
  previewImage.value = null;

  if (imageInput.value) {
    imageInput.value.value = '';
  }
}

function viewEventDetails() {
  if (createdEventId.value) {
    router.push(`/event-detail/${createdEventId.value}`);
  }
  showModal.value = false;
}

function createAnotherEvent() {
  showModal.value = false;
}

onMounted(async () => {
  try {
    const storedUser = localStorage.getItem('user');
    formData.value.code = generateRandomCode();

    if (storedUser) {
      const myUser = JSON.parse(storedUser);
      const response = await getUsers();

      // Filter pour me retirer de la liste des participants
      userList.value = response.users.filter(user => user._id !== myUser._id)
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
  }
})
</script>

<template>
  <div>
    <HeaderComponent />
    <div class="container mx-auto p-4">
      <!-- Notification -->
      <NotificationComponent
        v-if="notification.isVisible"
        :message="notification.message"
        :type="notification.type"
      />
      <NotificationComponent
      v-if="currentNotification.isVisible"
      :message="currentNotification.message"
      :type="currentNotification.type"
      :isVisible="currentNotification.isVisible"
    />

      <!-- Formulaire -->
      <form @submit.prevent="handleSubmit" class="space-y-6 bg-white p-8 shadow-lg rounded-lg">
        <h2 class="text-2xl font-bold text-center mb-6 text-gray-800">Créer un nouvel événement</h2>
        <div>
          <label for="eventName"  class="block font-medium text-gray-700">Nom de l'événement</label>
          <input
            v-model="formData.eventName"
            id="eventName"
            required
            type="text"
            placeholder="Entrez le nom de l'événement"
            class="w-full border rounded-lg p-3 mt-1 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="eventDate" class="block font-medium text-gray-700">Date</label>
            <input
              v-model="formData.eventDate"
              id="eventDate"
              type="date"
              class="w-full border rounded-lg p-3 mt-1 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label for="eventTime" class="block font-medium text-gray-700">Heure</label>
            <input
              v-model="formData.eventTime"
              id="eventTime"
              type="time"
              class="w-full border rounded-lg p-3 mt-1 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>
        </div>
        <div>
          <label for="eventLocation" class="block font-medium text-gray-700">Lieu</label>
          <input
            v-model="formData.eventLocation"
            id="eventLocation"
            type="text"
            placeholder="Entrez le lieu de l'événement"
            class="w-full border rounded-lg p-3 mt-1 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
        </div>
        <div>
          <label for="eventImage" class="block font-medium text-gray-700">Photo de l'événement</label>
          <input
            id="eventImage"
            ref="imageInput"
            type="file"
            class="block w-full text-gray-700 border rounded-lg p-3 mt-1"
            accept="image/*"
            @change="handleFileUpload"
          />
          <!-- Aperçu de l'image -->
          <div v-if="previewImage" class="mt-4">
            <p class="text-gray-700 font-medium">Aperçu :</p>
            <img
              :src="previewImage"
              alt="Aperçu de l'image"
              class="w-full max-w-sm rounded-lg shadow-md"
            />
          </div>
        </div>
        <div>
          <label for="eventColor" class="block font-medium text-gray-700">Thème couleur</label>
          <input
            v-model="formData.eventColor"
            id="eventColor"
            type="color"
            class="w-16 h-10 border rounded-lg mt-1"
          />
        </div>

        <div>

          <div>
            <label for="eventParticipants" class="block text-gray-800 font-medium mb-2">Invités :</label>
            <multiselect
              id="eventParticipants"
              v-model="selectedUsers"
              :options="userList"
              :multiple="true"
              :close-on-select="false"
              placeholder="Choisissez une ou plusieurs personnes"
              label="username"
              track-by="_id"
            >
              <template #option="{ option }: { option: User }">
                <img :src="option.photo" class="avatar" />
                <span>{{ option.username }}</span>
              </template>

              <template #selection="{ values }: { values: User[] }">
                <span v-for="user in values" :key="user._id" class="selection-item">
                  <img :src="user.photo" class="avatar-small" />
                  {{ user.username }}
                </span>
              </template>
            </multiselect>
          </div>
        </div>

        <!-- Toggle public/privé -->
        <div class="flex items-center justify-between mt-4">
          <label class="text-gray-700 font-medium">Événement public</label>
          <label class="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              v-model="formData.isPublic"
              class="sr-only peer"
            />
            <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-500 peer-focus:ring-2 peer-focus:ring-blue-300 transition"></div>
            <div
              class="absolute w-4 h-4 bg-white rounded-full top-1 left-1 peer-checked:left-6 transition"
            ></div>
          </label>
        </div>
        <div class="mb-4">
          <label for="eventCode" class="block text-gray-700 font-bold mb-2">
            Code de l'événement
          </label>
          <input
            id="eventCode"
            type="text"
            v-model="formData.code"
            class="border rounded w-full py-2 px-3 text-gray-700 bg-gray-100"
            disabled
          />
        </div>

        <button
          type="button"
          class="px-3 py-1 bg-blue-500 text-white rounded"
          @click="formData.code = generateRandomCode()"
        >
          Régénérer le code
        </button>

        <button
          type="submit"
          class="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-500 hover:to-blue-500 transition"
        >
          Créer l'événement
        </button>
      </form>
    </div>

    <!-- Modale après création -->
    <ModalComponent
      v-if="showModal"
      title="Événement créé avec succès !"
      :isVisible="showModal"
      :buttons="[
        { text: 'Ajouter à mon agenda', action: () => (showAddToCalendar = true), class: 'bg-green-500 text-white rounded-lg hover:bg-green-600 transition' },
        { text: 'Créer un autre événement', action: createAnotherEvent, class: 'bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition' },
        { text: 'Voir les détails', action: viewEventDetails, class: 'bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition' },

      ]"
      @close="createAnotherEvent"
    >
      <p class="text-gray-600">
        Souhaitez-vous voir les détails de l'événement ou en créer un nouveau ?
      </p>

    </ModalComponent>

    <AddToCalendarModal
      v-if="showAddToCalendar"
      :isVisible="showAddToCalendar"
      :title="createdEventData.title"
      :startDate="createdEventData.startDate"
      :startTime="createdEventData.startTime"
      :location="createdEventData.location"
      :description="createdEventData.description"
      @close="showAddToCalendar = false"
    />
  </div>
</template>

<style src="./CreateEventPage.css" lang="css" scoped></style>
