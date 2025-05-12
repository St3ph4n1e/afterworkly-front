<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { getEvents } from '@/axios/api';
import dayjs from 'dayjs';
import type { Event } from '@/assets/vue/types/types';
import { setupSocket } from '@/utils/socket.ts'

// Données et état
const events = ref<Event[]>([]);
const activeTab = ref('all'); // Onglet actif : 'all', 'upcoming', 'past', 'my-events'
const isLoading = ref(true);
const errorMessage = ref<string | null>(null);
const currentUserId = ref<string | null>(null); // ID de l'utilisateur connecté

// Récupérer l'ID de l'utilisateur connecté depuis le localStorage
onMounted(() => {
  const storedUser = sessionStorage.getItem('user');
  if (storedUser) {
    const user = JSON.parse(storedUser);
    currentUserId.value = user._id;
  }
});

let socket: any = null


// Chargement des événements depuis l'API
onMounted(async () => {
  try {
    isLoading.value = true;

    await getEvents().then(
      eventsRespons => {
        events.value = eventsRespons
      }
    )

  } catch (error) {
    console.error('Erreur lors de la récupération des événements:', error);
    errorMessage.value = 'Impossible de charger les événements. Veuillez réessayer plus tard.';
  } finally {
    isLoading.value = false;
  }

  socket = setupSocket();

  socket.on('event-update-all-events', (updatedEventData) =>  {
    events.value = updatedEventData
  })

});

// todo set filter logic in back

// Calcul des événements à venir, passés et créés par l'utilisateur
const upcomingEvents = computed(() =>
  events.value.filter((event) => dayjs(event.date).isAfter(dayjs()))
);

const pastEvents = computed(() =>
  events.value.filter((event) => dayjs(event.date).isBefore(dayjs()))
);

const myEvents = computed(() =>
  events.value.filter((event) => event.creator === currentUserId.value)
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
    case 'my-events':
      return 'Mes événements';
    default:
      return 'Tous les événements';
  }
});

onUnmounted(() => {
  socket.off('event-update-all-events')
})
</script>

<template>
  <div>
    <HeaderComponent />
    <div class="container mx-auto p-4">
      <!-- Titre dynamique -->
      <h1
        class="text-2xl font-bold mb-6 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text"
      >
        {{ pageTitle }}
      </h1>

      <!-- Tabs pour événements -->
      <div
        class="flex flex-wrap justify-center gap-2 mb-6"
        role="tablist"
      >
        <button
          @click="setActiveTab('all')"
          :class="[
            'px-6 py-2 text-sm sm:text-base font-medium transition',
            activeTab === 'all'
              ? 'bg-blue-500 text-white rounded-lg shadow'
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300',
          ]"
          role="tab"
          :aria-selected="activeTab === 'all'"
        >
          Tous les événements
        </button>
        <button
          @click="setActiveTab('upcoming')"
          :class="[
            'px-6 py-2 text-sm sm:text-base font-medium transition',
            activeTab === 'upcoming'
              ? 'bg-blue-500 text-white rounded-lg shadow'
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300',
          ]"
          role="tab"
          :aria-selected="activeTab === 'upcoming'"
        >
          Événements à venir
        </button>
        <button
          @click="setActiveTab('past')"
          :class="[
            'px-6 py-2 text-sm sm:text-base font-medium transition',
            activeTab === 'past'
              ? 'bg-blue-500 text-white rounded-lg shadow'
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300',
          ]"
          role="tab"
          :aria-selected="activeTab === 'past'"
        >
          Événements passés
        </button>
        <button
          @click="setActiveTab('my-events')"
          :class="[
            'px-6 py-2 text-sm sm:text-base font-medium transition',
            activeTab === 'my-events'
              ? 'bg-blue-500 text-white rounded-lg shadow'
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300',
          ]"
          role="tab"
          :aria-selected="activeTab === 'my-events'"
        >
          Mes événements
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
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-2"
      >
        <!-- Tous les événements -->
        <template v-if="activeTab === 'all'">
          <EventCardComponent
            v-for="event in events"
            :key="event.id"
            :id="event.id"
            :is-public="event.isPublic"
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
            :is-public="event.isPublic"
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
            :is-public="event.isPublic"
            :location="event.location"
            :date="event.date"
            :time="event.time"
            :image="event.image ?? undefined"
          />
          <p v-if="pastEvents.length === 0" class="text-center text-gray-500 col-span-full">
            Aucun événement passé.
          </p>
        </template>

        <!-- Mes événements -->
        <template v-else-if="activeTab === 'my-events'">
          <EventCardComponent
            v-for="event in myEvents"
            :key="event.id"
            :id="event.id"
            :title="event.title"
            :is-public="event.isPublic"
            :location="event.location"
            :date="event.date"
            :time="event.time"
            :image="event.image ?? undefined"
          />
          <p v-if="myEvents.length === 0" class="text-center text-gray-500 col-span-full">
            Vous n'avez créé aucun événement.
          </p>
        </template>
      </section>
    </div>
    <FooterComponent />
  </div>
</template>


<style src="./AllEventsPage.css" lang="css" scoped></style>
