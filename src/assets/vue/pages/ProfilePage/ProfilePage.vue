<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import Multiselect from 'vue-multiselect';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation, Pagination } from 'swiper/modules';
import { getUserProfile, updateUserProfile, updateUserAvatar } from '@/axios/api';
import type { Event } from '@/assets/vue/types/types';
import { getImageUrl } from '@/utils/url';
import 'vue-multiselect/dist/vue-multiselect.min.css';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// État global
const isEditing = ref(false);
const isAvatarUploading = ref(false);
const notification = ref<string | null>(null);
const activeTab = ref('profile');
const activeEventTab = ref('created');
const loading = ref(true);

// Données utilisateur avec valeurs par défaut
const user = ref({
  username: '',
  first_name: '',
  last_name: '',
  email: '',
  bio: '',
  photo: '',
  availability: [] as string[],
  preferences: [] as { label: string; value: string }[],
  notifications: true,
});
const eventsCreated = ref<Event[]>([]);
const eventsParticipating = ref<Event[]>([]);

const allDays = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];
const allPreferences = [
  { label: 'Végan', value: 'vegan' },
  { label: 'Consomme de l’alcool', value: 'alcool' },
  { label: 'Halal', value: 'halal' },
  { label: 'Viandard', value: 'viandard' },
];

// Charger les données utilisateur et ses événements
onMounted(async () => {

  try {
    const response = await getUserProfile();
    Object.assign(user.value, response.user);
    eventsCreated.value = response.eventsCreated;
    eventsParticipating.value = response.eventsParticipating;

    eventsCreated.value = response.eventsCreated.map((event: any) => ({
      ...event,
      id: event._id, // Transforme `_id` en `id`
    }));

    eventsParticipating.value = response.eventsParticipating.map((event: any) => ({
      ...event,
      id: event._id,
    }));

    // Affiche une notification uniquement si les champs critiques sont vides
    if (!user.value.username || !user.value.bio || user.value.availability.length === 0) {
      notification.value = 'Votre profil est incomplet. Pensez à le compléter !';
    }
  } catch (error) {
    console.error('Erreur lors du chargement des données utilisateur :', error);
    notification.value = 'Impossible de charger vos données.';
  } finally {
    loading.value = false;
  }

});

// Mise à jour du profil utilisateur
async function updateProfile() {
  try {
    const cleanedPreferences = user.value.preferences.filter(pref => pref && pref.value);

    const updatedUser = await updateUserProfile({
      ...user.value,
      preferences: cleanedPreferences,
    });

    Object.assign(user.value, updatedUser);
    notification.value = 'Votre profil a été mis à jour avec succès !';
    isEditing.value = false; // Fermer le formulaire
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil :', error);
    notification.value = 'Une erreur s’est produite. Veuillez réessayer.';
  }
}

// Upload d'avatar
async function handleAvatarUpload(event: Event & { target: HTMLInputElement }) {
  const file = event.target.files?.[0];
  if (file) {
    isAvatarUploading.value = true;
    try {
      const response = await updateUserAvatar(file);
      user.value.photo = response.photo;
      notification.value = 'Avatar mis à jour avec succès !';
    } catch (error) {
      console.error('Erreur lors de l\'upload de l\'avatar :', error);
      notification.value = 'Erreur lors de l\'upload. Veuillez réessayer.';
    } finally {
      isAvatarUploading.value = false;
    }
  }
}

// Gestion des jours de disponibilité
function toggleDay(day: string) {
  if (user.value.availability.includes(day)) {
    user.value.availability = user.value.availability.filter((d) => d !== day);
  } else {
    user.value.availability.push(day);
  }
}

</script>
<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <HeaderComponent />

    <main class="container mx-auto p-6 flex-grow space-y-6">
      <!-- Notification -->
      <NotificationComponent v-if="notification" :message="notification" type="warning" />

      <!-- Chargement -->
      <div v-if="loading" class="text-center py-20">
        <i class="fas fa-spinner fa-spin text-gray-500 text-3xl"></i>
      </div>

      <!-- Contenu principal -->
      <div v-else>
        <!-- Onglets -->
        <div class="flex justify-center space-x-4 mb-6">
          <button
            @click="activeTab = 'profile'"
            :class="[
              'px-6 py-2 font-medium rounded-t-lg transition',
              activeTab === 'profile' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
            ]"
          >
            Mon Profil
          </button>
          <button
            @click="activeTab = 'events'"
            :class="[
              'px-6 py-2 font-medium rounded-t-lg transition',
              activeTab === 'events' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
            ]"
          >
            Mes Événements
          </button>
        </div>

        <!-- Profil -->
        <div v-if="activeTab === 'profile'" class="bg-white shadow-lg rounded-lg p-6">
          <div class="flex flex-col items-center text-center relative">
            <!-- Avatar et appareil photo -->
            <div class="relative">
              <img
                :src="user.photo"
                alt="Photo de profil"
                class="w-32 h-32 rounded-full shadow-md object-cover"
              />
              <label
                for="avatar-upload"
                class="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full cursor-pointer hover:bg-blue-600 transition"
                title="Modifier l'avatar"
              >
                <i class="fas fa-camera text-white"></i>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleAvatarUpload"
                />
              </label>
            </div>

            <!-- Crayon pour mode édition -->
            <button
              @click="isEditing = !isEditing"
              class="absolute top-4 right-4 bg-transparent p-2 rounded-full"
              title="Modifier le profil"
            >
              <i class="fas fa-pencil-alt text-blue-500 hover:text-green-700"></i>
            </button>

            <!-- Affichage des données -->
            <div v-if="!isEditing" class="mt-4">
              <h2 class="text-2xl font-bold text-gray-800">{{ user.username }}</h2>
              <p class="text-gray-600 mt-2">{{ user.bio }}</p>
              <div class="mt-4">
                <h3 class="text-lg font-semibold">Disponibilités :</h3>
                <p>{{ user.availability.join(', ') || 'Non renseigné' }}</p>
              </div>
              <div class="mt-4">
                <h3 class="text-lg font-semibold">Préférences alimentaires :</h3>
                <p>
                  <span
                    v-for="pref in user.preferences"
                    :key="pref.value"
                    class="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded-md mr-2"
                  >
                    {{ pref.label }}
                  </span>
                  <span v-if="user.preferences.length === 0">Non renseigné</span>
                </p>
              </div>
            </div>

            <!-- Formulaire de modification -->
            <form v-else @submit.prevent="updateProfile" class="w-full max-w-md mt-6 space-y-4">
              <input v-model="user.username" type="text" class="w-full border rounded p-2" placeholder="Nom" />
              <textarea v-model="user.bio" class="w-full border rounded p-2" placeholder="Bio"></textarea>
              <div>
                <label class="block text-gray-800 font-medium mb-2">Jours de disponibilité :</label>
                <div class="flex flex-wrap gap-2">
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
                <label class="block text-gray-800 font-medium mb-2">Préférences alimentaires :</label>
                <Multiselect
                  v-model="user.preferences"
                  :options="allPreferences"
                  label="label"
                  track-by="value"
                  :multiple="true"
                />
              </div>
              <div>
                <label class="flex items-center">
                  <input type="checkbox" v-model="user.notifications" class="mr-2" />
                  Recevoir des notifications
                </label>
              </div>
              <button type="submit" class="w-full bg-blue-500 text-white py-2 rounded-lg">Enregistrer</button>
            </form>
          </div>
        </div>

        <!-- Événements -->
        <!-- Événements -->
        <div v-if="activeTab === 'events'" class="bg-white shadow-lg rounded-lg p-6">
          <div class="flex justify-center space-x-4 mb-6">
            <button
              @click="activeEventTab = 'created'"
              :class="[
                'px-6 py-2 font-medium rounded-t-lg transition',
                activeEventTab === 'created' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
              ]"
            >
              Événements créés
            </button>
            <button
              @click="activeEventTab = 'participating'"
              :class="[
                'px-6 py-2 font-medium rounded-t-lg transition',
                activeEventTab === 'participating' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
              ]"
            >
              Événements auxquels je participe
            </button>
          </div>

          <!-- Liste des événements -->
          <Swiper
            v-if="activeEventTab === 'created'"
            :modules="[Navigation, Pagination]"
            navigation
            pagination
          >
            <SwiperSlide v-for="event in eventsCreated" :key="event.id">
              <EventCardComponent
                :key="event.id"
                :id="event.id"
                :title="event.title"
                :location="event.location"
                :date="event.date"
                :time="event.time"
                :image="event.image ?? undefined"
              />
            </SwiperSlide>
          </Swiper>

          <Swiper
            v-if="activeEventTab === 'participating'"
            :modules="[Navigation, Pagination]"
            navigation
            pagination
          >
            <SwiperSlide v-for="event in eventsParticipating" :key="event.id">
              <EventCardComponent
                :key="event.id"
                :id="event.id"
                :title="event.title"
                :location="event.location"
                :date="event.date"
                :time="event.time"
                :image="event.image ?? undefined"
              />
            </SwiperSlide>
          </Swiper>
        </div>
      </div>
    </main>
  </div>
</template>





<style src="./ProfilePage.css" scoped></style>`;

