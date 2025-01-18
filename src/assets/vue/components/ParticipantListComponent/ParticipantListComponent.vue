<script setup lang="ts">
import type { EventParticipant } from '@/assets/vue/types/types'
import type { PropType } from 'vue';

defineProps({
  participants: {
    type: Array as PropType<EventParticipant[]>,
    required: true,
  },
})
</script>

<template>
  <ul class="space-y-2">
    <!-- Boucle sur les participants -->
    <li
      v-for="participant in participants"
      :key="participant.name"
      :class="{
        'text-green-600 font-semibold': participant.status === 'Confirmé',
        'text-yellow-600 italic': participant.status === 'Indécis',
      }"
    >
      {{ participant.name }} ({{ participant.status }})
    </li>
  </ul>
</template>



<style src="./ParticipantListComponent.css" scoped></style>
