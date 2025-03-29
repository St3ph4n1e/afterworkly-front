<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, computed } from 'vue';
import { notification, showError, showSuccess } from './utils/errors';


const isOffline = ref(false);
const wasOffline = ref(false);


function handleConnectionStatus() {
  if (navigator.onLine) {
    isOffline.value = false; 
    if (wasOffline.value) {
      showSuccess("Vous êtes maintenant connecté à Internet.");
    }
    wasOffline.value = false; 
  } else {
    isOffline.value = true; 
    showError("Vous avez perdu la connexion Internet. Certaines fonctionnalités peuvent être limitées.");
    wasOffline.value = true; 
  }
}

onMounted(() => {
  handleConnectionStatus();
  window.addEventListener('offline', handleConnectionStatus);
  window.addEventListener('online', handleConnectionStatus);
});

onBeforeUnmount(() => {
  window.removeEventListener('online', handleConnectionStatus);
  window.removeEventListener('offline', handleConnectionStatus);
});

const currentNotification = computed(() => notification.value);

</script>

<template>
  <div id="app">
    <div class="h-full w-full flex flex-col">
      <NotificationComponent
      v-if="currentNotification.isVisible"
      :message="currentNotification.message"
      :type="currentNotification.type"
      :isVisible="currentNotification.isVisible"
    />
      <router-view class="flex-grow"></router-view>
    </div>
  </div>
</template>

<style lang="css" scoped></style>
