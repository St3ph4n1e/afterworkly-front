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
      'fixed inset-y-0 left-0 w-64 bg-gray-800 text-white transform transition-transform duration-300',
      isOpen ? 'translate-x-0' : '-translate-x-full',
    ]"
  >
    <ul class="space-y-4 p-4">
      <li>
        <router-link to="/" class="flex items-center space-x-2 hover:underline">
          <i class="fa-solid fa-tachometer-alt"></i>
          <span>Dashboard</span>
        </router-link>
      </li>
      <li>
        <router-link to="/create-event" class="flex items-center space-x-2 hover:underline">
          <i class="fa-solid fa-calendar-plus"></i>
          <span>Créer un événement</span>
        </router-link>
      </li>
      <li>
        <router-link to="/profile" class="flex items-center space-x-2 hover:underline">
          <i class="fa-solid fa-user"></i>
          <span>Mon Profil</span>
        </router-link>
      </li>
      <li>
        <router-link to="/event-detail" class="flex items-center space-x-2 hover:underline">
          <i class="fa-solid fa-info-circle"></i>
          <span>Détail de l'événement</span>
        </router-link>
      </li>
      <li>
        <button
          @click="logout"
          class="flex items-center space-x-2 hover:underline w-full text-left"
        >
          <i class="fa-solid fa-right-from-bracket"></i>
          <span>Déconnexion</span>
        </button>
      </li>
    </ul>
    <button @click="toggleMenu" class="absolute top-4 right-4 text-lg">
      <i class="fa-solid fa-times"></i>
    </button>
  </nav>
</template>

<style src="./MenuComponent.css" lang="css" scoped></style>
