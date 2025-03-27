<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue';
import { showError, showSuccess } from './utils/errors';


const isOffline = ref(false);


function handleConnectionStatus() {
  if (navigator.onLine) {
    isOffline.value = false; 
    showSuccess("Vous êtes maintenant connecté à Internet.");
  } else {
    isOffline.value = true; 
    showError("Vous avez perdu la connexion Internet. Certaines fonctionnalités peuvent être limitées.", true); 
  }
}

onMounted(() => {
  handleConnectionStatus();

  window.addEventListener('online', handleConnectionStatus);
  window.addEventListener('offline', handleConnectionStatus);
});

onBeforeUnmount(() => {
  window.removeEventListener('online', handleConnectionStatus);
  window.removeEventListener('offline', handleConnectionStatus);
});

</script>

<template>
  <div id="app">
    <div class="h-full w-full flex flex-col">
      <NotificationComponent
      v-if="isOffline"
      :message="'Vous êtes hors ligne. Vérifiez votre connexion internet.'"
      :type="'error'"
    />
      <router-view class="flex-grow"></router-view>
    </div>
  </div>
</template>

<style lang="css" scoped></style>
