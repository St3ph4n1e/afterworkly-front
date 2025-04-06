<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from 'vue';

const props = defineProps({
  isVisible: Boolean,
  title: String,
  startDate: String, // Format YYYY-MM-DD
  startTime: String, // Format HH:mm
  location: String,
  description: String
});

const emit = defineEmits(['close']);

const calendarOptions = [
  { label: 'Google Calendar', value: 'google' },
  { label: 'Apple Calendar (.ics)', value: 'apple' },
  { label: 'Autre (.ics)', value: 'other' },
];

function generateGoogleCalendarLink() {
  const startDateTime = `${props.startDate.replace(/-/g, '')}T${props.startTime.replace(':', '')}00Z`;
  const endDateTime = `${props.startDate.replace(/-/g, '')}T${props.startTime.replace(':', '')}59Z`;
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    props.title || ''
  )}&dates=${startDateTime}/${endDateTime}&details=${encodeURIComponent(
    props.description || ''
  )}&location=${encodeURIComponent(props.location || '')}`;
}

function downloadICSFile() {
  const icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:${props.title}\nDTSTART:${
    props.startDate.replace(/-/g, '') + 'T' + props.startTime.replace(':', '') + '00Z'
  }\nDTEND:${
    props.startDate.replace(/-/g, '') + 'T' + props.startTime.replace(':', '') + '59Z'
  }\nLOCATION:${props.location}\nDESCRIPTION:${props.description}\nEND:VEVENT\nEND:VCALENDAR`;

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${props.title || 'evenement'}.ics`;
  link.click();
}

function handleSelection(value: string) {
  if (value === 'google') {
    window.open(generateGoogleCalendarLink(), '_blank');
  } else {
    downloadICSFile();
  }
  emit('close');
}
</script>

<template>
  <div v-if="isVisible" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
    <div class="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md text-center">
      <h2 class="text-xl font-bold mb-4">Ajouter à mon agenda</h2>
      <p class="text-gray-600 mb-6">Choisissez un calendrier pour ajouter l'événement :</p>
      <div class="space-y-3">
        <button
          v-for="option in calendarOptions"
          :key="option.value"
          @click="handleSelection(option.value)"
          class="w-full py-2 px-4 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition"
        >
          {{ option.label }}
        </button>
      </div>
      <button
        @click="$emit('close')"
        class="mt-6 text-sm text-gray-500 hover:underline"
      >
        Annuler
      </button>
    </div>
  </div>
</template>

<style scoped>
</style>
