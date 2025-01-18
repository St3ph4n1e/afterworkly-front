<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { getEvents } from '@/axios/api';
import dayjs from 'dayjs';
import type { Event } from '@/assets/vue/types/types';

// Données et état
const events = ref<Event[]>([]);
const activeTab = ref('all'); // Onglet actif : 'all', 'upcoming', 'past'
const isLoading = ref(true);
const errorMessage = ref<string | null>(null);

// Chargement des événements depuis l'API
onMounted(async () => {
  try {
    isLoading.value = true;
    events.value = await getEvents(); // Récupère tous les événements depuis l'API
  } catch (error: any) {
    console.error('Erreur lors de la récupération des événements:', error);
    errorMessage.value = 'Impossible de charger les événements. Veuillez réessayer plus tard.';
  } finally {
    isLoading.value = false;
  }
});

// Calcul des événements à venir et passés
const upcomingEvents = computed(() =>
  events.value.filter((event) => dayjs(event.date).isAfter(dayjs()))
);

const pastEvents = computed(() =>
  events.value.filter((event) => dayjs(event.date).isBefore(dayjs()))
);

// Fonction pour changer l'onglet actif
function setActiveTab(tab: string) {
  activeTab.value = tab;
}

// Titre dynamique
const pageTitle = computed(() => {
  switch (activeTab.value) {
    case 'upcoming':
      return 'Événements à venir';
    case 'past':
      return 'Événements passés';
    default:
      return 'Tous les événements';
  }
});
</script>

<template>
  <div>
    <HeaderComponent />
    <div class="container mx-auto p-4">
      <!-- Titre dynamique -->
      <h1
        class="text-2xl font-bold mb-6  bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text"
      >
        {{ pageTitle }}
      </h1>

      <!-- Tabs pour événements -->
      <div class="flex justify-center mb-6">
        <button
          @click="setActiveTab('all')"
          :class="[
            'px-6 py-2 font-medium transition',
            activeTab === 'all'
              ? 'bg-blue-500 text-white rounded-t-lg shadow'
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300',
          ]"
        >
          Tous les événements
        </button>
        <button
          @click="setActiveTab('upcoming')"
          :class="[
            'px-6 py-2 font-medium transition',
            activeTab === 'upcoming'
              ? 'bg-blue-500 text-white rounded-t-lg shadow'
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300',
          ]"
        >
          Événements à venir
        </button>
        <button
          @click="setActiveTab('past')"
          :class="[
            'px-6 py-2 font-medium transition',
            activeTab === 'past'
              ? 'bg-blue-500 text-white rounded-t-lg shadow'
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300',
          ]"
        >
          Événements passés
        </button>
      </div>

      <!-- Indicateur de chargement -->
      <div v-if="isLoading" class="text-center">
        <p class="text-gray-500">Chargement des événements...</p>
      </div>

      <!-- Message d'erreur -->
      <div v-if="errorMessage" class="text-center text-red-500">
        <p>{{ errorMessage }}</p>
      </div>

      <!-- Liste des événements -->
      <section
        v-if="!isLoading && !errorMessage"
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
      >
        <!-- Tous les événements -->
        <template v-if="activeTab === 'all'">
          <EventCardComponent
            v-for="event in events"
            :key="event.id"
            :id="event.id"
            :title="event.title"
            :location="event.location"
            :date="event.date"
            :time="event.time"
            :image="event.image ?? undefined"
          />
        </template>

        <!-- Événements à venir -->
        <template v-else-if="activeTab === 'upcoming'">
          <EventCardComponent
            v-for="event in upcomingEvents"
            :key="event.id"
            :id="event.id"
            :title="event.title"
            :location="event.location"
            :date="event.date"
            :time="event.time"
            :image="event.image ?? undefined"
          />
          <p v-if="upcomingEvents.length === 0" class="text-center text-gray-500 col-span-full">
            Aucun événement à venir.
          </p>
        </template>

        <!-- Événements passés -->
        <template v-else-if="activeTab === 'past'">
          <EventCardComponent
            v-for="event in pastEvents"
            :key="event.id"
            :id="event.id"
            :title="event.title"
            :location="event.location"
            :date="event.date"
            :time="event.time"
            :image="event.image ?? undefined"
          />
          <p v-if="pastEvents.length === 0" class="text-center text-gray-500 col-span-full">
            Aucun événement passé.
          </p>
        </template>
      </section>
    </div>
    <FooterComponent />
  </div>
</template>

<style src="./AllEventsPage.css" lang="css" scoped></style>
