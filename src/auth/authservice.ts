import axios   from "axios";
import { login, signUp } from '@/axios/api.ts'
import type { User } from '../assets/vue/types/types.ts';


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
    if (error.response?.status === 404) {
      throw new Error("User not registered. Please sign up first.");
    }
    console.error("Login failed:", error);
    throw new Error("Échec de la connexion");
  }

  console.error("unexpected error:", error);
  throw new Error("Erreur inattendue");
}

}



export async function createUser(userData: User) {
  try {
    const response = await signUp(userData)
    console.log("User created:", response.data);
  } catch (error: unknown) {
    console.error("Error signing up:", error);
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
