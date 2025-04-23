<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { createUser, loginUser } from '@/auth/authservice.ts';
import { showError, showSuccess, currentNotification } from '../../../../utils/errors.ts';


const router = useRouter();

// Initialement sur la page de connection
const isSignUp = ref(false);

const formData = ref({
  username: "",
  email: "",
  password: "",
});

const notification = ref<{
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  isVisible: boolean;
}>({
  message: '',
  type: 'info',
  isVisible: false,
});

async function handleKeycloakLoginRegister() {
  if (isSignUp.value) {
    try {
      // Créer un nouvel utilisateur
      const token = await createUser({
        email: formData.value.email,
        username: formData.value.username,
        password: formData.value.password,
      });

      if (token) {
        // Après la création, passer en mode connexion

        showSuccess("Inscription réussie, vous pouvez maintenant vous connecter.");

        // Bascule sur la connexion
        isSignUp.value = false;  // Passe en mode connexion
      }

    } catch (error) {
      showError(error.message || "Erreur lors de l'inscription. Veuillez réessayer.");
    }

  } else {
    // Connexion de l'utilisateur
    try {
      await loginUser(formData.value.email, formData.value.password).then(
        _ => {
          // Redirige vers la page d'accueil ou tableau de bord
          router.push("/");
        }
      )
    } catch (error) {
      showError(error.message || "Erreur lors de la connexion. Veuillez vérifier vos identifiants.");
    }
  }
}
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
    <!-- Notification -->
    <NotificationComponent v-if="notification.isVisible" :message="notification.message" :type="notification.type" />
    <NotificationComponent
      v-if="currentNotification.isVisible"
      :message="currentNotification.message"
      :type="currentNotification.type"
      :isVisible="currentNotification.isVisible"
    />

    <div class="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
      <div class="text-center mb-6">
        <img src="/logo.png" alt="Logo" class="w-16 h-16 mx-auto mb-4" />
        <h1 class="text-3xl font-extrabold text-gray-800">Afterworkly</h1>
      </div>

      <h2 class="text-2xl font-semibold text-center mb-4" :class="isSignUp ? 'text-purple-600' : 'text-blue-600'">
        {{ isSignUp ? 'Créer un compte' : 'Se connecter' }}
      </h2>

      <form @submit.prevent="handleKeycloakLoginRegister" class="space-y-6">
        <div v-if="isSignUp">
          <label for="name" class="block text-gray-700 font-medium">Nom</label>
          <input v-model="formData.username" id="name" type="text" placeholder="Votre nom"
                 class="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-300" />
        </div>

        <div>
          <label for="email" class="block text-gray-700 font-medium">Email</label>
          <input v-model="formData.email" id="email" type="email" placeholder="Votre email"
                 class="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-300" />
        </div>

        <div>
          <label for="password" class="block text-gray-700 font-medium">Mot de passe</label>
          <input v-model="formData.password" id="password" type="password" placeholder="Votre mot de passe"
                 class="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-300" />
        </div>

        <button type="submit"
                class="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 px-4 rounded-lg hover:from-purple-500 hover:to-blue-500 transition">
          {{ isSignUp ? "S'inscrire" : 'Se connecter' }}
        </button>
      </form>

      <p class="text-center mt-6 text-gray-700">
        {{ isSignUp ? 'Déjà un compte ?' : 'Pas encore de compte ?' }}
        <button @click="isSignUp = !isSignUp" class="text-purple-600 font-semibold hover:underline">
          {{ isSignUp ? 'Se connecter' : 'Créer un compte' }}
        </button>
      </p>
    </div>
  </div>
</template>
