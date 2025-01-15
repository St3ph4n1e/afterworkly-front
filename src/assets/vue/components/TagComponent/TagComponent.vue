<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps({
  label: { type: String, required: true },
  selected: { type: Boolean, default: false },
})

const isSelected = ref(props.selected)

function toggleSelection() {
  isSelected.value = !isSelected.value
}

watch(isSelected, (newValue) => {
  console.log(`Tag "${props.label}" selection changed to:`, newValue)
})
</script>

<template>
  <span
    :class="[
      'px-4 py-2 border rounded cursor-pointer',
      isSelected ? 'bg-blue-500 text-white' : 'bg-gray-200',
    ]"
    @click="toggleSelection"
  >
    {{ label }}
  </span>
</template>

<style scoped></style>
