<script setup lang="ts">
const formData = {
  eventName: '',
  eventDate: '',
  eventTime: '',
  eventLocation: '',
}

function handleSubmit() {
  console.log('Événement créé :', formData)
  alert('Événement créé avec succès !')
}
</script>

<template>
  <div>
    <HeaderComponent />
    <div class="container mx-auto p-4">
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label for="eventName" class="block">Nom de l'événement</label>
          <input
            v-model="formData.eventName"
            id="eventName"
            type="text"
            class="w-full border rounded p-2"
          />
        </div>
        <div>
          <label for="eventDate" class="block">Date</label>
          <input
            v-model="formData.eventDate"
            id="eventDate"
            type="date"
            class="w-full border rounded p-2"
          />
        </div>
        <div>
          <label for="eventTime" class="block">Heure</label>
          <input
            v-model="formData.eventTime"
            id="eventTime"
            type="time"
            class="w-full border rounded p-2"
          />
        </div>
        <div>
          <label for="eventLocation" class="block">Lieu</label>
          <input
            v-model="formData.eventLocation"
            id="eventLocation"
            type="text"
            class="w-full border rounded p-2"
          />
        </div>
        <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded">
          Créer l'événement
        </button>
      </form>
    </div>
    <FooterComponent />
  </div>
</template>
<style src="./CreateEventPage.css" lang="css" scoped></style>
