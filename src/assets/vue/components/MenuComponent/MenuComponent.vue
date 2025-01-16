<script setup lang="ts">
import { useRouter } from 'vue-router'

defineProps<{
  isOpen: boolean
  toggleMenu: () => void
}>()

const router = useRouter()

function logout() {
  localStorage.removeItem('user') // Supprime l'utilisateur du localStorage
  router.push('/auth') // Redirige vers la page d'authentification
}
</script>

<template>
  <nav
    :class="[
      'fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-gray-800 to-gray-900 text-white shadow-xl transform transition-transform duration-300 ease-in-out',
      isOpen ? 'translate-x-0' : '-translate-x-full',
    ]"
  >
    <!-- Logo -->
    <div class="p-6 text-center">
      <img src="/logo.png" alt="Logo" class="w-16 h-16 mx-auto rounded-full shadow-md" />
      <h1 class="text-xl font-bold mt-2 tracking-wide text-blue-300">Afterwork'ly</h1>
    </div>

    <!-- Menu items -->
    <ul class="space-y-6 px-4 mt-4">
      <li>
        <router-link
          to="/"
          class="flex items-center space-x-3 p-3 rounded-md hover:bg-gray-700 hover:shadow-lg transition"
        >
          <i class="fa-solid fa-tachometer-alt text-blue-400"></i>
          <span class="text-lg font-medium">Dashboard</span>
        </router-link>
      </li>
      <li>
        <router-link
          to="/create-event"
          class="flex items-center space-x-3 p-3 rounded-md hover:bg-gray-700 hover:shadow-lg transition"
        >
          <i class="fa-solid fa-calendar-plus text-green-400"></i>
          <span class="text-lg font-medium">Créer un événement</span>
        </router-link>
      </li>
      <li>
        <router-link
          to="/profile"
          class="flex items-center space-x-3 p-3 rounded-md hover:bg-gray-700 hover:shadow-lg transition"
        >
          <i class="fa-solid fa-user text-yellow-400"></i>
          <span class="text-lg font-medium">Mon Profil</span>
        </router-link>
      </li>
      <li>
        <router-link
          to="/all-events"
          class="flex items-center space-x-3 p-3 rounded-md hover:bg-gray-700 hover:shadow-lg transition"
        >
          <i class="fa-solid fa-calendar-days text-pink-400"></i>
          <span class="text-lg font-medium">Tous les événements</span>
        </router-link>
      </li>
      <li>
        <button
          @click="logout"
          class="flex items-center space-x-3 p-3 rounded-md hover:bg-gray-700 hover:shadow-lg transition w-full text-left"
        >
          <i class="fa-solid fa-right-from-bracket text-red-400"></i>
          <span class="text-lg font-medium">Déconnexion</span>
        </button>
      </li>
    </ul>

    <!-- Close button -->
    <button
      @click="toggleMenu"
      class="absolute top-4 right-4 text-white hover:text-blue-300 transition text-2xl"
    >
      <i class="fa-solid fa-times"></i>
    </button>
  </nav>
</template>

<style src="./MenuComponent.css" lang="css" scoped></style>
