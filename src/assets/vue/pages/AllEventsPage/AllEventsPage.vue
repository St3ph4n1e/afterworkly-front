<script setup lang="ts">
import { getEvents } from '@/axios/api.ts'
import { onMounted, ref } from 'vue'

const events = ref([]);

onMounted(async () => {
  try {
    events.value = await getEvents();
  } catch (error) {
    console.error("Error fetching events:", error);
  }
});

</script>

<template>
  <div>
    <HeaderComponent />
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-6">Tous les événements</h1>
      <section class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <EventCardComponent
          v-for="event in events"
          :key="event.id"
          :id="event.id"
          :title="event.title"
          :location="event.location"
          :date="event.date"
          :image="event.image ?? ''"
        />
      </section>
    </div>
    <FooterComponent />
  </div>
</template>
<style src="./AllEventsPage.css" lang="css" scoped></style>
