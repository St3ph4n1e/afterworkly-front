<script setup lang="ts">
import { logoutUser } from "@/auth/authservice.ts";

defineProps<{
  isOpen: boolean;
  toggleMenu: () => void;
}>();

function logout() {
  logoutUser();
}

const menuItems = [
  {color:'text-blue-400', icon: 'fa-solid fa-tachometer-alt', text: 'Dashboard', link: '/' },
  {color:'text-green-400', icon: 'fa-solid fa-calendar-plus', text: 'Créer un événement', link: '/create-event' },
  { color:'text-yellow-400',icon: 'fa-solid fa-user', text: 'Mon Profil', link: '/profile' },
  {color:'text-pink-400', icon: 'fa-solid fa-calendar-days', text: 'Tous les événements', link: '/all-events' },
]

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
      <li v-for="item in menuItems" :key="item.text">
        <router-link
          :to="item.link"
          class="flex items-center space-x-3 p-3 rounded-md hover:bg-gray-700 hover:shadow-lg transition"
        >
          <i :class="[item.icon, item.color]" ></i>
          <span class="text-lg font-medium">{{item.text}}</span>
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
