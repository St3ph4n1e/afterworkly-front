<script setup lang="ts">
import { ref, watch, type PropType } from 'vue';

// Définition des props avec PropType
const props = defineProps({
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String as PropType<'info' | 'success' | 'error' | 'warning'>,
    default: 'info',
  },
  duration: {
    type: Number, // Durée en millisecondes
    default: null, // `null` signifie que la notification restera visible indéfiniment
  },
});

const isVisible = ref(true);

function closeNotification() {
  isVisible.value = false;
}

// Gestion de la durée d'affichage
if (typeof props.duration === 'number' && props.duration > 0) {
  setTimeout(() => {
    closeNotification();
  }, props.duration);
}
</script>

<template>
  <div
    v-if="isVisible"
   class="notification-component"
    :class="[
      'fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-4 rounded shadow-lg text-center',
      type === 'success'
        ? 'bg-green-100 text-green-800'
        : type === 'error'
          ? 'bg-red-100 text-red-800'
      :type === 'warning'
      ? 'bg-yellow-100 text-yellow-800'
          : 'bg-blue-100 text-blue-800',
    ]" 
  >
    <span>{{ message }}</span>
    <button @click="closeNotification" class="ml-4 text-xl font-bold">&times;</button>
  </div>
</template>

<style src="./NotificationComponent.css" lang="css" scoped></style>
