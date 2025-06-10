<script setup lang="ts">
import { removeParticipant } from '@/axios/api'
import { showSuccess } from '@/utils/errors'

// Props typées
const props = defineProps({
  participantInfos: {
    type: Object,
    required: true,
  },
  confirmedClass: {
    type: String,
    default: 'text-green-600 font-semibold',
  },
  undecidedClass: {
    type: String,
    default: 'text-yellow-600 italic',
  },
  eventId: {
    type: String,
    required: true
  },
  isCreator: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['participantRemoved', 'participantClicked']);

async function handleRemoveParticipant() {
  try {
    const params = props.participantInfos.type === 'member'
      ? { userId: props.participantInfos.userId, type: 'member' as const }
      : { username: props.participantInfos.username, type: 'outsider' as const };

    await removeParticipant(props.eventId, params);
    showSuccess(`${props.participantInfos.username} a bien été retiré de l'événement`);
    emit('participantRemoved', props.participantInfos.userId || props.participantInfos.username);
  } catch (error) {
    console.error('Erreur lors de la suppression du participant :', error);
  }
}

function handleParticipantClick() {
  emit('participantClicked', props.participantInfos);
}
</script>

<template>
  <div
    style="width: 100%; margin-top: 10px; display: flex; flex-direction: column; align-items: flex-start;"
    :class="{ 'opacity-50 grayscale': participantInfos.status === 'pending' }"
  >
    <div
      style="display: flex; flex-direction: column; align-items: center"
      class="relative cursor-pointer hover:opacity-80 transition-opacity"
      @click="handleParticipantClick"
    >
      <button
        v-if="isCreator"
        @click.stop="handleRemoveParticipant"
        class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition"
        title="Supprimer le participant"
      >
        <i class="fas fa-times text-sm"></i>
      </button>
      <img
        v-if="participantInfos.photo"
        :src="participantInfos.photo"
        alt="Avatar"
        class="w-12 h-12 rounded-full"
      />
      <p v-if="participantInfos.username">
        {{ participantInfos.username }}
      </p>
    </div>
  </div>
</template>


<style src="./ParticipantListComponent.css" scoped></style>
