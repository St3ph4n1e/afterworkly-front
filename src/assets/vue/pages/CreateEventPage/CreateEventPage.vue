<script setup lang="ts">
import { ref } from 'vue';
import { createEvent } from '@/axios/api';
import { useRouter } from 'vue-router';
import axios from 'axios';
import {  showError, showSuccess, currentNotification } from '../../../../utils/errors.ts';


const router = useRouter();

const formData = ref({
  eventName: '',
  eventDate: '',
  eventTime: '',
  eventLocation: '',
  eventImage: null as File | null,
  eventColor: '#ffffff',
  isPublic: true, // Champ pour définir si l'événement est public ou privé
});

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
});

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

async function handleSubmit() {


  const date = new Date()

  if(formData.value.eventDate < date.toISOString().split('T')[0]) {
    showError("La date de l'événement ne peut pas être dans le passé.");
    return;
  }

  const eventData = new FormData();
  eventData.append('title', formData.value.eventName);
  eventData.append('date', formData.value.eventDate);
  eventData.append('time', formData.value.eventTime);
  eventData.append('location', formData.value.eventLocation);
  eventData.append('color', formData.value.eventColor);
  eventData.append('isPublic', formData.value.isPublic.toString());



  if (formData.value.eventImage) {
    eventData.append('image', formData.value.eventImage);
  }

  try {
    const response = await createEvent(eventData);
    createdEventId.value = response.event._id;

  // Préparer les infos pour le calendrier
    createdEventData.value = {
      title: response.event.title,
      startDate: response.event.date,
      startTime: response.event.time,
      location: response.event.location,
      description: response.event.description || '',
    };


    notification.value = {
      message: 'Événement créé avec succès !',
      type: 'success',
      isVisible: true,
    };
    showSuccess("Événement créé avec succès !");
    resetForm();
    showModal.value = true;
  } catch (error) {
    if(axios.isAxiosError(error)) {
      showError(error.response?.data.message || 'Une erreur est survenue.');
    } else {
      showError(error?.message || 'Une erreur est survenue.');
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
    isPublic: true,
  };
  previewImage.value = null;
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
        { text: 'Ajouter à mon agenda', action: () => (showAddToCalendar = true), class: 'bg-green-500 text-white' },
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
