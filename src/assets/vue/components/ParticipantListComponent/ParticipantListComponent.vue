<script setup lang="ts">

// Props typées
defineProps({
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
  }
});

</script>

<template>
  <div style="width: 100%; margin-top: 10px; display: flex; flex-direction: column; align-items: flex-start;">
    <div style="display: flex; flex-direction: column; align-items: center">
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
