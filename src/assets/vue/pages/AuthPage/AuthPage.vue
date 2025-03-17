<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { signUp, login } from '@/axios/api'

const router = useRouter()
const isSignUp = ref(false)

const formData = ref({
  name: '',
  email: '',
  password: '',
})

const notification = ref({
  message: '',
  type: '', // 'error' ou 'success'
  isVisible: false,
})

async function handleSubmit() {
  try {
    if (isSignUp.value) {
      // Inscription
      await signUp(formData.value);
      notification.value = {
        message: 'Inscription réussie ! Vous pouvez maintenant vous connecter.',
        type: 'success',
        isVisible: true,
      };
      isSignUp.value = false; // Passe en mode connexion
    } else {
      // Connexion
      const user = await login(formData.value);
      localStorage.setItem('token', user.token); // Stocke le token JWT
      localStorage.setItem('user', JSON.stringify(user)); // Stocke les informations utilisateur
      router.push('/'); // Redirection après connexion
    }
  } catch (error: any) {
    notification.value = {
      message: error.message || 'Une erreur est survenue.',
      type: 'error',
      isVisible: true,
    };
  } finally {
    formData.value = { name: '', email: '', password: '' };
    setTimeout(() => (notification.value.isVisible = false), 3000);
  }
}


onMounted(() => {
  const storedUser = localStorage.getItem('user')
  if (storedUser) {
    router.push('/') // Redirige automatiquement si connecté
  }
})
</script>



<template>
  <div
    class="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
  >
    <!-- Notification -->
    <NotificationComponent
      v-if="notification.isVisible"
      :message="notification.message"
      :type="notification.type"
    />

    <!-- Formulaire dans une carte -->
    <div class="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-6">
        <img src="/logo.png" alt="Logo" class="w-16 h-16 mx-auto mb-4" />
        <h1 class="text-3xl font-extrabold text-gray-800">Afterworkly</h1>
      </div>

      <!-- Titre -->
      <h2
        class="text-2xl font-semibold text-center mb-4"
        :class="isSignUp ? 'text-purple-600' : 'text-blue-600'"
      >
        {{ isSignUp ? 'Créer un compte' : 'Se connecter' }}
      </h2>

      <!-- Formulaire -->
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Champ Nom (uniquement pour l'inscription) -->
        <div v-if="isSignUp">
          <label for="name" class="block text-gray-700 font-medium">Nom</label>
          <input
            v-model="formData.name"
            id="name"
            type="text"
            placeholder="Votre nom"
            class="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
        </div>

        <!-- Champ Email -->
        <div>
          <label for="email" class="block text-gray-700 font-medium">Email</label>
          <input
            v-model="formData.email"
            id="email"
            type="email"
            placeholder="Votre email"
            class="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        <!-- Champ Mot de passe -->
        <div>
          <label for="password" class="block text-gray-700 font-medium">Mot de passe</label>
          <input
            v-model="formData.password"
            id="password"
            type="password"
            placeholder="Votre mot de passe"
            class="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>

        <!-- Bouton de soumission -->
        <button
          type="submit"
          class="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-4 rounded-lg hover:from-purple-500 hover:to-blue-500 transition"
        >
          {{ isSignUp ? "S'inscrire" : 'Se connecter' }}
        </button>
      </form>

      <!-- Toggle entre Inscription et Connexion -->
      <p class="text-center mt-6 text-gray-700">
        {{ isSignUp ? 'Déjà un compte ?' : 'Pas encore de compte ?' }}
        <button @click="isSignUp = !isSignUp" class="text-purple-600 font-semibold hover:underline">
          {{ isSignUp ? 'Se connecter' : 'Créer un compte' }}
        </button>
      </p>
    </div>
  </div>
</template>

<style scoped></style>
