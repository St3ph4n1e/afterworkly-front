<script setup lang="ts">
import type { Event } from '@/assets/vue/types/types';
import { onMounted, ref } from 'vue'
import { addOutsiderToParticipates, getEventById, getEventByIdForOutsider } from '@/axios/api.ts'
import { useRoute, useRouter } from 'vue-router'
import { notification } from '@/utils/errors.ts'

const isCodeValid = ref<boolean>(false)
const event = ref<Event>()
const codeInput = ref<string>('')
const router = useRouter()

const formData = ref({
  username: "",
  photo: "",
  type: 'outsider'
});

const route = useRoute()

function showNotification(message: string, type: 'success' | 'error') {
  notification.value = { message, type, isVisible: true }
  setTimeout(() => (notification.value.isVisible = false), 2000)
}
const eventId = route.query.eventid as string

onMounted(async () => {

  try {
    const eventResponse = await getEventByIdForOutsider(eventId)
    if (eventResponse && eventResponse.event) {
      console.log('Raw event response:', eventResponse)
      // Extract the nested event object
      event.value = {
        ...eventResponse.event,
        id: eventResponse.event._id || eventResponse.event.id
      }
      console.log('Processed event value:', event.value)
    }
  } catch (error) {
    showNotification('Erreur lors du chargement de l\'événement', 'error')
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

async function joinEvent() {
  console.log(formData.value)
  if (!formData.value.username || !formData.value.photo) {
    showNotification('Veuillez remplir tous les champs', 'error')
    return
  }

  try {
    await addOutsiderToParticipates(eventId, formData.value.username, formData.value.photo).then(
      () => {
        const user = JSON.stringify(
          {
            username: formData.value.username,
            photo: formData.value.photo
          }
        )

        localStorage.setItem('outsider', user)
        showNotification('Vous avez rejoint l\'événement avec succès !', 'success')
      }
    )

    // router.push(`/event-detail/${event.value?.id}`)
  } catch (error) {
    showNotification('Erreur lors de la tentative de rejoindre l\'événement', 'error')
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

      <!-- Code Verification Form -->
      <div v-if="!isCodeValid" class="space-y-4">
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
          <label class="block text-gray-700 font-medium mb-2">Photo de profil (URL)</label>
          <input
            v-model="formData.photo"
            type="text"
            class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="URL de votre photo de profil"
          />
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
