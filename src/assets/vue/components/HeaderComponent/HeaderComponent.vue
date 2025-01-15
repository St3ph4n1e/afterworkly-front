<script setup lang="ts">
import { ref } from 'vue'
import MenuComponent from '../MenuComponent/MenuComponent.vue'

const isMenuOpen = ref(false)

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value
}
</script>

<template>
  <header class="bg-gray-800 text-white p-4 flex justify-between items-center">
    <div class="flex items-center space-x-2">
      <img src="/logo.png" alt="Afterworkly Logo" class="w-10 h-10" />
      <h1 class="text-lg font-bold">Afterworkly</h1>
    </div>
    <!-- Bouton pour mobile uniquement -->
    <button @click="toggleMenu" class="text-lg">
      <i class="fas fa-bars"></i>
    </button>
    <!-- Menu -->
    <MenuComponent :isOpen="isMenuOpen" :toggleMenu="toggleMenu" />
  </header>
</template>

<style scoped>
/* Aucun style supplémentaire nécessaire */
</style>

<style src="./HeaderComponent.css" lang="css" scoped></style>
