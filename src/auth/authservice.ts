import axios from "axios";
import { login, signUp } from '@/axios/api.ts'
import type { User } from '../assets/vue/types/types.ts';
import { showError } from "../utils/errors.ts"
import { setupSocket } from '@/utils/socket.ts'
import { trackUserSession } from '@/utils/metrics.ts'

export async function loginUser(mail: string, password: string) {
  try {
    const response = await login({ mail, password });

    // Stocker le jeton d'accès dans sessionStorage
    localStorage.setItem('access_token', response.token);
    // Le jeton d'actualisation devrait idéalement être stocké dans un cookie httpOnly
    // utilisation temporaire de localStorage (moins sécurisé)
    localStorage.setItem('refresh_token', response.refresh_token);
    localStorage.setItem('user', JSON.stringify(response.user));
    trackUserSession.start(response.user.id || response.user._id);

    const socket = setupSocket();

    return response;
  } catch (error: unknown ) {
    if (axios.isAxiosError(error)) {
      // Gestion des erreurs spécifiques
      if (error.response?.status === 404) {
        showError("Utilisateur non enregistré. Veuillez vous inscrire d'abord.");
      } else if (error.response?.status === 401) {
        showError("Échec de la connexion. Vérifiez vos identifiants.");
      } else {
        showError("Échec de la connexion. Veuillez réessayer plus tard.");
      }
    } else {
      showError("Une erreur inattendue s'est produite.");
    }
    return Promise.reject(error);
  }
}

export async function createUser(userData: User) {
  try {
    const response = await signUp(userData);
    return response.data;
  } catch (error: unknown) {
    console.error("Error signing up:", error);
    if (axios.isAxiosError(error)) {
      showError("Erreur lors de l'inscription. Veuillez réessayer.");
    } else {
      showError("Erreur inattendue lors de l'inscription.");
    }
    throw error;
  }
}

export function logoutUser() {

  const user = localStorage.getItem('user');
  if (user) {
    try {
      const userData = JSON.parse(user);
      trackUserSession.end(userData.id || userData._id);
    } catch (e) { console.warn('Could not parse user data for metrics'); }
  }
  const refreshToken = localStorage.getItem("refresh_token");

  if (!refreshToken) {
    console.warn("No refresh token found, skipping logout request.");
    return;
  }

  // Appeler le point de terminaison de déconnexion de Keycloak
  axios
    .post(
      `${import.meta.env.VITE_KEYCLOAK_BASE_URL}/realms/${import.meta.env.VITE_REALM_NAME}/protocol/openid-connect/logout`,
      new URLSearchParams({
        client_id: import.meta.env.VITE_CLIENT_ID,
        client_secret: import.meta.env.VITE_CLIENT_SECRET,
        refresh_token: refreshToken,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    )
    .then(() => {
      console.log("Logged out from Keycloak");

      // Supprimer les jetons du stockage
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");

      // Rediriger vers la page de connexion
      window.location.href = "/auth"; // À ajuster si nécessaire
    })
    .catch(err => console.error("Keycloak logout error:", err));

  // Supprimer les jetons stockés
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");

}

export function isUserAuthenticated() {
  return !!localStorage.getItem("user")
}

