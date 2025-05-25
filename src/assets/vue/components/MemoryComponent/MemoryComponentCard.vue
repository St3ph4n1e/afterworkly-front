<script setup lang="ts">
import { onMounted } from 'vue';


const props = defineProps({
  text: { type: String, required: false },
  image: { type: String, required: false },
  memoryId: { type: String, required: true },
  issuedBy: { type: String, required: true },
  currentUserId: { type: String, required: false }
})

const emit = defineEmits<{
  deleteMemory: [memoryId: string]
}>()

function handleDeleteMemory() {
  emit('deleteMemory', props.memoryId)
}

onMounted(() => {
  console.log(props.issuedBy)
})

</script>

<template>
  <div
    class="aftw-event-card bg-white shadow rounded-lg p-6 flex flex-col items-center space-y-4 mx-6 transition transform hover:scale-105 hover:shadow-xl h-full relative"
  >
    <button
      v-if="issuedBy === currentUserId"
      @click="handleDeleteMemory"
      class="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:bg-red-600 transition-colors text-sm"
      title="Supprimer le souvenir"
    >
      <i class="fas fa-trash"></i>
    </button>

    <div class="w-full h-56 overflow-hidden rounded-lg bg-gray-200">
      <img :src="image" :alt="`Image de l'événement des participants`" class="w-full h-full object-cover" />
    </div>

    <p class="text-gray-600 text-center">
      <span class="font-medium">{{ text }}</span>
    </p>


  </div>

</template>

<style scoped>

</style>
