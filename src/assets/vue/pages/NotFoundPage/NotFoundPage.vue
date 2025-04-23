<script setup lang="ts"></script>

<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-r from-blue-500 to-purple-500 text-white">
    <!-- Header -->
    <HeaderComponent />

    <!-- Contenu principal -->
    <main class="flex-grow flex items-center justify-center text-center p-6">
      <div>
        <h1 class="text-6xl font-extrabold mb-4">404</h1>
        <p class="text-xl font-light mb-6">Oups 😱 ! La page que vous recherchez n'existe pas.</p>
        <router-link
          to="/"
          class="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-100 transition"
        >
          Retour à l'accueil
        </router-link>
      </div>
    </main>

    <!-- Footer -->
    <FooterComponent />
  </div>
</template>

<style lang="css" scoped>
main {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
}
</style>
