<script setup lang="ts">
import { showError } from '@/utils/errors';
import { useRouter } from 'vue-router';

const router = useRouter();

function tryReconnect() {
  if (navigator.onLine) {
    const redirectPath = sessionStorage.getItem('offlineRedirectPath') || '/';
    sessionStorage.removeItem('offlineRedirectPath');
    router.push(redirectPath);
  } else {
    showError("Toujours hors ligne. Réessayez plus tard.");
  }
}
</script>

<template>
    <div class="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-center p-6">
      <p style="font-size: 60px">😬</p>
      <h1 class="text-2xl font-bold text-red-600 mb-2">Vous êtes hors ligne</h1>
      <p class="text-gray-700 mb-4">Veuillez vérifier votre connexion Internet pour continuer.</p>
      <button @click="tryReconnect" class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">
        Réessayer
      </button>
    </div>
  </template>


