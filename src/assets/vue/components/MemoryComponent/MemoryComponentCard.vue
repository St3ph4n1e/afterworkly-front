<script setup lang="ts">


const props = defineProps({
  text: { type: String, required: false },
  image: { type: String, required: false }
})

</script>

<template>
  <div
    class="aftw-event-card bg-white shadow rounded-lg p-6 flex flex-col items-center space-y-4 mx-6 transition transform hover:scale-105 hover:shadow-xl h-full"
  >
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
