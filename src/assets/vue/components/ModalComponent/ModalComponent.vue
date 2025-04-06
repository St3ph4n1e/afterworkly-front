
<script setup lang="ts">
 defineProps<{
  isVisible: boolean;
  title: string;
  buttons: { text: string; action: () => void; class?: string }[];
}>();

 defineEmits(['close']);
</script>


<template>
    <div v-if="isVisible" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div class="bg-white rounded-lg shadow-lg p-6 w-11/12 md:w-1/3">
        <!-- Titre -->
        <h3 class="text-xl font-bold text-gray-800 mb-4">{{ title }}</h3>
  
        <!-- Contenu -->
        <div class="text-gray-600 mb-6">
          <slot></slot>
        </div>
  
        <!-- Boutons -->

        
        <div class="flex justify-around space-x-4">
          <button
            v-for="button in buttons"
            :key="button.text"
            @click="button.action"
            :class="button.class || 'bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition'"
          >
            {{ button.text }}
          </button>
        </div>
      </div>
    </div>
  </template>
  

  <style scoped>
  /* Styles personnalisés si nécessaire */
  </style>
  