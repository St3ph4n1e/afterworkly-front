<script setup lang="ts">
import type { EventParticipant } from '@/assets/vue/types/types'

// Définir les props avec l'interface
defineProps<{
  participants: EventParticipant[]
}>()
</script>

<template>
  <ul class="space-y-2">
    <!-- Boucle sur les participants -->
    <li
      v-for="participant in participants"
      :key="participant.name"
      :class="{
        'text-green-600': participant.status === 'Confirmé',
        'text-yellow-600': participant.status === 'Indécis',
      }"
    >
      {{ participant.name }} ({{ participant.status }})
    </li>
  </ul>
</template>

<style src="./ParticipantListComponent.css" scoped></style>
