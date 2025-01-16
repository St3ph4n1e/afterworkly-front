<script setup lang="ts">
import { mockEvents } from '../../mocks/events'

const events = mockEvents
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
          :image="event.image"
        />
      </section>
    </div>
    <FooterComponent />
  </div>
</template>
<style src="./AllEventsPage.css" lang="css" scoped></style>
