import axios   from "axios";
import { login, signUp } from '@/axios/api.ts'
import type { User } from '../assets/vue/types/types.ts';
import { showError } from "../utils/errors.ts"


export async function loginUser(mail: string, password: string) {
  try {
    const response = await login({ mail, password });

    // Store access token in sessionStorage
    sessionStorage.setItem("access_token", response.token);

    // Refresh token should ideally be stored in an httpOnly cookie
    // temporarily use localStorage (less secure)
    localStorage.setItem("refresh_token", response.refresh_token);

    sessionStorage.setItem("user", JSON.stringify(response.user));

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

  const refreshToken = localStorage.getItem("refresh_token");

  if (!refreshToken) {
    console.warn("No refresh token found, skipping logout request.");
    return;
  }

  // Call Keycloak logout endpoint
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

      // Clear tokens from storage
      sessionStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      sessionStorage.removeItem("user");

      // Redirect to login page
      window.location.href = "/auth"; // Adjust as needed
    })
    .catch(err => console.error("Keycloak logout error:", err));


  // Clear stored tokens
  sessionStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  sessionStorage.removeItem("user");

}
