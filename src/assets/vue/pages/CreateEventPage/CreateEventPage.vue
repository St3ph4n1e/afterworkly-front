<script setup lang="ts">
import { ref } from 'vue'
import NotificationComponent from '../../components/NotificationComponent/NotificationComponent.vue'

const formData = ref({
  eventName: '',
  eventDate: '',
  eventTime: '',
  eventLocation: '',
  eventImage: null as File | null,
  eventColor: '#ffffff', // Couleur par défaut
})

const previewImage = ref<string | null>(null)
const notification = ref({
  message: '',
  type: '', // 'success' ou 'error'
  isVisible: false,
})

function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0] || null
  formData.value.eventImage = file

  if (file) {
    const reader = new FileReader()
    reader.onload = () => {
      previewImage.value = reader.result as string
    }
    reader.readAsDataURL(file)
  } else {
    previewImage.value = null
  }
}

function handleSubmit() {
  if (
    formData.value.eventName &&
    formData.value.eventDate &&
    formData.value.eventLocation &&
    formData.value.eventImage
  ) {
    console.log('Événement créé :', formData.value)

    notification.value = {
      message: 'Événement créé avec succès !',
      type: 'success',
      isVisible: true,
    }

    // Réinitialisation des données
    formData.value = {
      eventName: '',
      eventDate: '',
      eventTime: '',
      eventLocation: '',
      eventImage: null,
      eventColor: '#ffffff',
    }
    previewImage.value = null

    // Masquer la notification après 3 secondes
    setTimeout(() => {
      notification.value.isVisible = false
    }, 3000)
  } else {
    notification.value = {
      message: 'Veuillez remplir tous les champs obligatoires.',
      type: 'error',
      isVisible: true,
    }

    // Masquer la notification après 3 secondes
    setTimeout(() => {
      notification.value.isVisible = false
    }, 3000)
  }
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

      <form @submit.prevent="handleSubmit" class="space-y-6 bg-white p-6 shadow-lg rounded-lg">
        <div>
          <label for="eventName" class="block font-medium">Nom de l'événement</label>
          <input
            v-model="formData.eventName"
            id="eventName"
            type="text"
            class="w-full border rounded p-2"
          />
        </div>
        <div>
          <label for="eventDate" class="block font-medium">Date</label>
          <input
            v-model="formData.eventDate"
            id="eventDate"
            type="date"
            class="w-full border rounded p-2"
          />
        </div>
        <div>
          <label for="eventTime" class="block font-medium">Heure</label>
          <input
            v-model="formData.eventTime"
            id="eventTime"
            type="time"
            class="w-full border rounded p-2"
          />
        </div>
        <div>
          <label for="eventLocation" class="block font-medium">Lieu</label>
          <input
            v-model="formData.eventLocation"
            id="eventLocation"
            type="text"
            class="w-full border rounded p-2"
          />
        </div>
        <div>
          <label for="eventImage" class="block font-medium">Photo de l'événement</label>
          <input
            id="eventImage"
            type="file"
            class="block w-full text-gray-700 border rounded p-2"
            accept="image/*"
            @change="handleFileUpload"
          />
          <!-- Aperçu de l'image -->
          <div v-if="previewImage" class="mt-4">
            <p class="text-gray-700 font-medium">Aperçu :</p>
            <img
              :src="previewImage"
              alt="Aperçu de l'image"
              class="w-full max-w-sm rounded shadow-md"
            />
          </div>
        </div>
        <div>
          <label for="eventColor" class="block font-medium">Thème couleur</label>
          <input
            v-model="formData.eventColor"
            id="eventColor"
            type="color"
            class="w-16 h-10 border rounded"
          />
        </div>
        <button
          type="submit"
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          Créer l'événement
        </button>
      </form>
    </div>
    <FooterComponent />
  </div>
</template>

<style src="./CreateEventPage.css" lang="css" scoped></style>
