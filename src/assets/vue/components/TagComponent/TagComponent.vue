<script setup lang="ts">
import { ref, watch, computed, type PropType, defineEmits } from 'vue'

// Définir les props
const props = defineProps({
  label: { type: String, required: true },
  selected: { type: Boolean, default: false },
})

// Déclarer les événements émis
const emit = defineEmits(['update:selected'])

// Utiliser une référence locale pour la sélection
const isSelected = ref(props.selected)

// Gestion du clic pour basculer la sélection
function toggleSelection() {
  isSelected.value = !isSelected.value
  emit('update:selected', isSelected.value) // Émettre la mise à jour vers le parent
}

// Observer les changements sur `selected` prop pour synchroniser l'état local
watch(
  () => props.selected,
  (newValue) => {
    isSelected.value = newValue
  }
)
</script>

<template>
  <span
    :class="[
      'px-4 py-2 border rounded cursor-pointer transition',
      isSelected
        ? 'bg-blue-500 text-white border-blue-500'
        : 'bg-gray-200 text-gray-800 border-gray-300',
    ]"
    @click="toggleSelection"
  >
    {{ label }}
  </span>
</template>

<style scoped>
span {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}
</style>
