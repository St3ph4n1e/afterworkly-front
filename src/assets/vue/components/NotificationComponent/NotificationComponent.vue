<script setup lang="ts">
import { ref } from 'vue'

defineProps({
  message: { type: String, required: true },
  type: { type: String, default: 'info' }, // Types : 'info', 'success', 'error'
})

const isVisible = ref(true)

function closeNotification() {
  isVisible.value = false
}
</script>

<template>
  <div
    v-if="isVisible"
    :class="[
      'fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-4 rounded shadow-lg text-center',
      type === 'success'
        ? 'bg-green-100 text-green-800'
        : type === 'error'
          ? 'bg-red-100 text-red-800'
          : 'bg-blue-100 text-blue-800',
    ]"
    style="z-index: 1000"
  >
    <span>{{ message }}</span>
    <button @click="closeNotification" class="ml-4 text-xl font-bold">&times;</button>
  </div>
</template>

<style src="./NotificationComponent.css" lang="css" scoped></style>
