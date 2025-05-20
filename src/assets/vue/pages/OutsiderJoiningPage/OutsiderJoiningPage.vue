<script setup lang="ts">
import type { Event } from '@/assets/vue/types/types';
import { onMounted, ref } from 'vue'
import {
  addOutsiderToParticipates,
  getEventByIdForOutsider,
  validateJoinLink,
  markJoinLinkAsUsed
} from '@/axios/api.ts'
import { useRoute, useRouter } from 'vue-router'
import { notification } from '@/utils/errors.ts'

const isCodeValid = ref<boolean>(false)
const isLinkValid = ref<boolean>(false)
const event = ref<Event>()
const codeInput = ref<string>('')
const router = useRouter()
const isLoading = ref<boolean>(true)
const linkError = ref<string>('')

const formData = ref({
  username: "",
  photo: null as File | null,
  type: 'outsider'
});

const previewImage = ref<string | null>(null);

const route = useRoute()

function showNotification(message: string, type: 'success' | 'error') {
  notification.value = { message, type, isVisible: true }
  setTimeout(() => (notification.value.isVisible = false), 2000)
}

const eventId = route.query.eventId as string
const token = route.query.token as string

onMounted(async () => {
  if (!eventId || !token) {
    linkError.value = 'Lien invalide'
    isLoading.value = false
    return
  }

  try {
    // First validate the join link
    await validateJoinLink(eventId, token)
    isLinkValid.value = true

    // Then fetch event details
    const eventResponse = await getEventByIdForOutsider(eventId)
    if (eventResponse && eventResponse.event) {
      event.value = {
        ...eventResponse.event,
        id: eventResponse.event._id || eventResponse.event.id
      }
    }
  } catch (error: any) {
    linkError.value = error.message || 'Lien invalide ou expiré'
    showNotification(linkError.value, 'error')
  } finally {
    isLoading.value = false
  }
})

function checkCodeValidity() {
  console.log('Current event value:', event.value)
  if (event.value?.code) {
    console.log('Comparing codes:', { eventCode: event.value.code, inputCode: codeInput.value })
    if (event.value.code === codeInput.value) {
      console.log('Code match!')
      isCodeValid.value = true
    } else {
      console.log('Code mismatch')
      showNotification('Code incorrect', 'error')
    }
  } else {
    console.log('No event or code found')
    showNotification('Événement non trouvé', 'error')
  }
}

function handleFileUpload(event: globalThis.Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0] || null;
  formData.value.photo = file;

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

async function joinEvent() {
  if (!formData.value.username) {
    showNotification('Veuillez entrer votre nom d\'utilisateur', 'error')
    return
  }

  try {


    const formDataToSend = new FormData();
    formDataToSend.append('username', formData.value.username);
    if (formData.value.photo) {
      formDataToSend.append('photo', formData.value.photo);
    }
    formDataToSend.append('type', formData.value.type);

    await addOutsiderToParticipates(eventId, formDataToSend).then(
      async () => {
        const user = JSON.stringify({
          username: formData.value.username,
          photo: previewImage.value
        })
        // Marquer le lien d'invitation comme utilisé avant de rejoindre
        await markJoinLinkAsUsed(eventId, token)

        localStorage.setItem('outsider', user)
        showNotification('Vous avez rejoint l\'événement avec succès !', 'success')
        router.push(`/event-detail-outsider/${eventId}`)
      }
    )
  } catch (error: any) {
    showNotification(error.message || 'Erreur lors de la tentative de rejoindre l\'événement', 'error')
  }
}
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
    <div class="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
      <div class="text-center mb-6">
        <img src="/logo.png" alt="Logo" class="w-16 h-16 mx-auto mb-4" />
        <h1 class="text-3xl font-extrabold text-gray-800">Afterworkly</h1>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p class="mt-4 text-gray-600">Vérification du lien...</p>
      </div>

      <!-- Invalid Link Error -->
      <div v-else-if="!isLinkValid" class="text-center">
        <div class="text-red-500 mb-4">
          <i class="fas fa-exclamation-circle text-4xl"></i>
        </div>
        <h2 class="text-xl font-semibold text-gray-800 mb-2">Lien invalide</h2>
        <p class="text-gray-600">{{ linkError }}</p>
      </div>

      <!-- Code Verification Form -->
      <div v-else-if="!isCodeValid" class="space-y-4">
        <div>
          <label class="block text-gray-700 font-medium mb-2">Code d'accès</label>
          <input
            v-model="codeInput"
            type="text"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Entrez le code d'accès"
          />
        </div>
        <button
          @click="checkCodeValidity"
          class="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Vérifier le code
        </button>
      </div>

      <!-- User Details Form -->
      <div v-else class="space-y-4">
        <div>
          <label class="block text-gray-700 font-medium mb-2">Nom d'utilisateur</label>
          <input
            v-model="formData.username"
            type="text"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Votre nom d'utilisateur"
          />
        </div>
        <div>
          <label class="block text-gray-700 font-medium mb-2">Photo de profil</label>
          <input
            type="file"
            accept="image/*"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            @change="handleFileUpload"
          />
          <div v-if="previewImage" class="mt-4">
            <img :src="previewImage" alt="Aperçu" class="w-32 h-32 rounded-full object-cover mx-auto" />
          </div>
        </div>
        <button
          @click="joinEvent"
          class="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
        >
          Rejoindre l'événement
        </button>
      </div>
    </div>
  </div>
</template>
