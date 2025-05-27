<script setup lang="ts">
import { onMounted, ref } from 'vue';

const props = defineProps({
  text: { type: String, required: false },
  image: { type: String, required: false },
  memoryId: { type: String, required: true },
  issuedBy: { type: String, required: true },
  currentUserId: { type: String, required: false }
})

const emit = defineEmits<{
  deleteMemory: [memoryId: string]
  editMemory: [memoryId: string, text: string, image: File | null]
}>()

const isEditMode = ref(false)
const editText = ref('')
const editImage = ref<File | null>(null)
const editImagePreview = ref<string | null>(null)

function handleDeleteMemory() {
  emit('deleteMemory', props.memoryId)
}

function startEdit() {
  isEditMode.value = true
  editText.value = props.text || ''
  editImage.value = null
  editImagePreview.value = null
}

function cancelEdit() {
  isEditMode.value = false
  editText.value = ''
  editImage.value = null
  if (editImagePreview.value) {
    URL.revokeObjectURL(editImagePreview.value)
    editImagePreview.value = null
  }
}

function handleImageUpload(event: Event) {
  const input = event.target as HTMLInputElement
  if (input && input.files && input.files.length > 0) {
    const file = input.files[0]
    editImage.value = file
    editImagePreview.value = URL.createObjectURL(file)
  }
}

function saveEdit() {
  emit('editMemory', props.memoryId, editText.value, editImage.value)
  isEditMode.value = false
}

function removeNewImage() {
  editImage.value = null
  if (editImagePreview.value) {
    URL.revokeObjectURL(editImagePreview.value)
    editImagePreview.value = null
  }
}

onMounted(() => {
  console.log(props.issuedBy)
})
</script>

<template>
  <div
    class="aftw-event-card bg-white shadow rounded-lg p-6 flex flex-col items-center space-y-4 mx-6 transition transform hover:scale-105 hover:shadow-xl h-full relative"
  >
    <div v-if="issuedBy === currentUserId && !isEditMode" class="absolute top-2 right-2 flex space-x-1">
      <button
        @click="startEdit"
        class="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:bg-blue-600 transition-colors text-sm"
        title="Modifier le souvenir"
      >
        <i class="fas fa-pen"></i>
      </button>
      <button
        @click="handleDeleteMemory"
        class="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:bg-red-600 transition-colors text-sm"
        title="Supprimer le souvenir"
      >
        <i class="fas fa-trash"></i>
      </button>
    </div>

    <div v-if="!isEditMode" class="w-full h-56 overflow-hidden rounded-lg bg-gray-200">
      <img :src="image" :alt="`Image de l'événement des participants`" class="w-full h-full object-cover" />
    </div>

    <p v-if="!isEditMode" class="text-gray-600 text-center">
      <span class="font-medium">{{ text }}</span>
    </p>

    <div v-if="isEditMode" class="w-full space-y-4">
      <h3 class="text-lg font-semibold text-gray-800 text-center">Modifier le souvenir</h3>

      <div>
        <label class="block text-gray-700 font-medium mb-2">Description</label>
        <textarea
          v-model="editText"
          class="w-full border rounded-lg p-2 text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
          placeholder="Décrivez ce souvenir..."
          rows="3"
        ></textarea>
      </div>

      <!-- Edit Image  -->
      <div>
        <label class="block text-gray-700 font-medium mb-2">Image</label>

        <div v-if="!editImagePreview" class="mb-3">
          <p class="text-sm text-gray-500 mb-2">Image actuelle:</p>
          <img :src="image" class="w-full h-32 object-cover rounded-lg border border-gray-200" alt="Image actuelle" />
        </div>

        <div v-if="editImagePreview" class="mb-3">
          <p class="text-sm text-gray-500 mb-2">Nouvelle image:</p>
          <div class="relative">
            <img :src="editImagePreview" class="w-full h-32 object-cover rounded-lg border border-gray-200" alt="Nouvelle image" />
            <button
              @click="removeNewImage"
              class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md hover:bg-red-600 transition-colors text-xs"
              title="Supprimer la nouvelle image"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <!-- Upload File  -->
        <label class="block w-full border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
          <i class="fas fa-camera text-xl text-gray-400 mb-1"></i>
          <p class="text-gray-500 text-sm text-center">
            {{ editImagePreview ? 'Changer l\'image' : 'Ajouter une nouvelle image' }}
          </p>
          <input
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleImageUpload"
          />
        </label>
      </div>

      <div class="flex space-x-2 pt-4">
        <button
          @click="cancelEdit"
          class="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Annuler
        </button>
        <button
          @click="saveEdit"
          class="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          Sauvegarder
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
