<script setup lang="ts">
const user = {
  name: 'Jean Dupont',
  bio: 'Passionné par les afterworks conviviaux !',
  photo: 'https://via.placeholder.com/150',
  availability: ['Lundi', 'Jeudi', 'Vendredi'],
  preferences: 'vegan',
  notifications: true,
}

const allDays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi']

function toggleDay(day) {
  if (user.availability.includes(day)) {
    user.availability = user.availability.filter((d) => d !== day)
  } else {
    user.availability.push(day)
  }
}

function updateProfile() {
  console.log('Profil mis à jour :', user)
  alert('Votre profil a été mis à jour !')
}
</script>

<template>
  <div>
    <HeaderComponent />
    <div class="container mx-auto p-4 space-y-4">
      <div class="text-center">
        <img :src="user.photo" alt="Photo Profil" class="w-24 h-24 rounded-full mx-auto" />
        <h2 class="text-xl font-bold">{{ user.name }}</h2>
        <p>{{ user.bio }}</p>
      </div>
      <form @submit.prevent="updateProfile" class="space-y-4">
        <div>
          <h3 class="font-semibold">Jours de disponibilité</h3>
          <div class="flex space-x-2">
            <TagComponent
              v-for="day in allDays"
              :key="day"
              :label="day"
              :selected="user.availability.includes(day)"
              @click="toggleDay(day)"
            />
          </div>
        </div>
        <div>
          <h3 class="font-semibold">Préférences alimentaires</h3>
          <select v-model="user.preferences" class="border rounded w-full p-2">
            <option value="vegan">Végan</option>
            <option value="alcool">Consomme de l'alcool</option>
            <option value="halal">Halal</option>
            <option value="viandard">Viandard</option>
          </select>
        </div>
        <div>
          <label class="flex items-center space-x-2">
            <input type="checkbox" v-model="user.notifications" />
            <span>Recevoir des notifications</span>
          </label>
        </div>
        <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded">
          Modifier le Profil
        </button>
      </form>
    </div>
    <FooterComponent />
  </div>
</template>
<style src="./ProfilePage.css" lang="css" scoped></style>
