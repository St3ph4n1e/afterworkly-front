<script setup lang="ts">
import type { EventParticipant } from '@/assets/vue/types/types';
import { ref, type PropType } from 'vue';

// Props typées
const props = defineProps({
  participants: {
    type: Array as PropType<EventParticipant[]>,
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
  limit: {
    type: Number,
    default: 0, // 0 signifie pas de limite
  },
});

// État local pour contrôler la pagination (afficher plus de participants)
const showLimit = ref(props.limit);

function showMore() {
  showLimit.value = props.participants.length; // Affiche tous les participants
}
</script>

<template>
  <ul role="list" aria-label="Liste des participants" class="space-y-2">
    <!-- Boucle sur les participants avec une limite -->
    <li
      v-for="(participant, index) in (showLimit ? participants.slice(0, showLimit) : participants)"
      :key="participant.userId"
      :class="{
        [confirmedClass]: participant.status === 'Confirmé',
        [undecidedClass]: participant.status === 'Indécis',
        'text-gray-600': !['Confirmé', 'Indécis'].includes(participant.status),
      }"
      class="flex items-center space-x-4"
    >
      <img
        v-if="participant.avatar"
        :src="participant.avatar"
        alt="Avatar"
        class="w-8 h-8 rounded-full"
      />
      <span>{{ participant.name }} ({{ participant.status }})</span>
    </li>
  </ul>

  <!-- Icône "Voir plus" si la limite est active -->
  <div
    v-if="limit > 0 && participants.length > limit && showLimit < participants.length"
    @click="showMore"
    class="mt-4 text-blue-600 cursor-pointer flex justify-center items-center"
    title="Voir plus"
    role="button"
    aria-label="Voir plus"
  >
    <i class="fa-solid fa-plus text-xl"></i>
  </div>
</template>

<style src="./ParticipantListComponent.css" scoped></style>
