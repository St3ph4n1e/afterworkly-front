<script setup lang="ts">
defineProps<{
  text: string;
  image: string;
}>();
</script>

<template>
  <div class="memory-card w-full h-full flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-md transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1">
    <div class="image-container mb-4 w-full h-40 overflow-hidden rounded-md">
      <img :src="image" :alt="text" class="w-full h-full object-cover" />
    </div>
    <div class="text-container text-center">
      <p class="text-gray-800 font-medium">{{ text }}</p>
    </div>
  </div>
</template>

<style scoped>
.memory-card {
  min-height: 200px;
  height: 100%;
  border: 1px solid #eaeaea;
  display: flex;
  flex-direction: column;
}

.image-container {
  flex: 1;
  min-height: 150px;
}

.image-container img {
  transition: transform 0.3s ease;
}

.memory-card:hover .image-container img {
  transform: scale(1.05);
}
</style>
