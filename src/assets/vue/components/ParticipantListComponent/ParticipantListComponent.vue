<script setup lang="ts">
// Définir une interface pour les participants
interface Participant {
  name: string
  status: 'Confirmé' | 'Indécis'
}

// Définir les props avec l'interface
defineProps<{
  participants: Participant[]
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
