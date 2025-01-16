<script setup lang="ts">
import { ref, computed } from 'vue'
import { mockEvents } from '../../mocks/events'
import Multiselect from 'vue-multiselect'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Pagination } from 'swiper/modules' // Import des modules
import 'vue-multiselect/dist/vue-multiselect.min.css'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const user = ref({
  name: 'Jean Dupont',
  bio: 'Passionné par les afterworks conviviaux !',
  photo: '/src/assets/images/user.jpeg',
  availability: ['Lundi', 'Jeudi', 'Vendredi'],
  preferences: ['vegan'],
  notifications: true,
  events: [1, 3, 4, 5, 6],
})

const allDays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi']
const allPreferences = [
  { label: 'Végan', value: 'vegan' },
  { label: 'Consomme de l’alcool', value: 'alcool' },
  { label: 'Halal', value: 'halal' },
  { label: 'Viandard', value: 'viandard' },
]

const activeTab = ref('profile') // Onglet actif
const notification = ref<string | null>(null) // Notification

function toggleDay(day: string) {
  if (user.value.availability.includes(day)) {
    user.value.availability = user.value.availability.filter((d) => d !== day)
  } else {
    user.value.availability.push(day)
  }
}

function updateProfile() {
  notification.value = 'Votre profil a été mis à jour avec succès !'
  setTimeout(() => {
    notification.value = null
  }, 3000)
}

const userEvents = computed(() =>
  mockEvents
    .filter((event) => user.value.events.includes(event.id))
    .map((event) => ({
      ...event,
      image: event.image || '/src/assets/images/logo.png',
    })),
)
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-100">
    <HeaderComponent />

    <main class="container mx-auto p-6 flex-grow space-y-6">
      <!-- Notification -->
      <NotificationComponent v-if="notification" :message="notification" type="success" />

      <!-- Profil utilisateur toujours visible -->
      <div class="bg-white shadow-lg rounded-lg p-6 flex flex-col items-center text-center">
        <img
          :src="user.photo"
          alt="Photo Profil"
          class="w-32 h-32 rounded-full mx-auto shadow-md object-cover"
        />
        <h2 class="text-2xl font-bold text-gray-800 mt-4">{{ user.name }}</h2>
        <p class="text-gray-600 mt-2">{{ user.bio }}</p>
      </div>

      <!-- Tabs -->
      <div class="flex justify-center space-x-8 text-center">
        <button
          @click="activeTab = 'profile'"
          :class="[
            'px-6 py-3 font-medium transition duration-300 ease-in-out rounded-t-lg',
            activeTab === 'profile'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300',
          ]"
        >
          Infos du Profil
        </button>
        <button
          @click="activeTab = 'events'"
          :class="[
            'px-6 py-3 font-medium transition duration-300 ease-in-out rounded-t-lg',
            activeTab === 'events'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300',
          ]"
        >
          Mes Événements
        </button>
      </div>

      <!-- Contenu des Tabs -->
      <div v-if="activeTab === 'profile'" class="bg-white shadow-lg rounded-lg p-6 space-y-6">
        <form @submit.prevent="updateProfile" class="space-y-6">
          <div>
            <h3 class="text-lg font-semibold text-gray-800">Jours de disponibilité</h3>
            <div class="flex flex-wrap gap-2 mt-2">
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
            <h3 class="text-lg font-semibold text-gray-800">Préférences alimentaires</h3>
            <div class="border rounded p-2">
              <Multiselect
                v-model="user.preferences"
                :options="allPreferences"
                label="label"
                track-by="value"
                placeholder="Sélectionnez vos préférences"
                :multiple="true"
              />
            </div>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-lg text-gray-800">Recevoir des notifications</span>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="user.notifications" class="sr-only peer" />
              <div
                class="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-500 peer-focus:ring-4 peer-focus:ring-blue-300 transition"
              ></div>
              <div
                class="absolute w-4 h-4 bg-white rounded-full top-1 left-1 peer-checked:left-6 transition"
              ></div>
            </label>
          </div>

          <button
            type="submit"
            class="w-full bg-blue-500 text-white py-3 rounded-lg font-medium shadow-md hover:bg-blue-600 transition"
          >
            Modifier le Profil
          </button>
        </form>
      </div>

      <!-- Tab: Mes Événements -->
      <div v-if="activeTab === 'events'" class="bg-white shadow-lg rounded-lg p-6 space-y-6">
        <h3 class="text-xl font-bold text-gray-800">Mes événements</h3>

        <!-- Affichage classique des événements
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <EventCardComponent
            v-for="event in userEvents"
            :key="event.id"
            :id="event.id"
            :title="event.title"
            :location="event.location"
            :date="event.date"
            :image="event.image"
          />
        </div> -->

        <!-- Carrousel des événements si plus de 3 -->
        <div v-if="userEvents.length > 3" class="mt-6">
          <h4 class="text-lg font-semibold text-gray-800 mb-4">Parcourir les événements</h4>
          <Swiper
            :modules="[Navigation, Pagination]"
            navigation
            pagination
            :slides-per-view="1"
            :space-between="10"
            :breakpoints="{
              640: { slidesPerView: 2 },
              768: { slidesPerView: 3 },
            }"
          >
            <SwiperSlide v-for="event in userEvents" :key="event.id">
              <EventCardComponent
                :id="event.id"
                :title="event.title"
                :location="event.location"
                :date="event.date"
                :image="event.image"
              />
            </SwiperSlide>
          </Swiper>
        </div>
      </div>
    </main>

    <FooterComponent />
  </div>
</template>

<style src="./ProfilePage.css" lang="css" scoped></style>
