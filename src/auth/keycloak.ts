import axios from "axios";
import { login, signUp } from '@/axios/api.ts'

async function getClientToken() {
  const data = new URLSearchParams();
  data.append("client_id", import.meta.env.VITE_CLIENT_ID);
  data.append("client_secret", import.meta.env.VITE_CLIENT_SECRET);
  data.append("grant_type", "client_credentials");  // Client Credentials Flow

  try {
    const response = await axios.post(import.meta.env.VITE_KEYCLOAK_URL, data, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    console.log(response.data);
    return response.data.access_token;  // Return the access token
  } catch (error) {
    console.error("Error getting client token:", error.response?.data || error.message);
    throw new Error("Failed to get token");
  }
}


export async function loginUser(mail: string, password: string) {
  try {
    const response = await login({mail: mail, password: password});
    console.log(response)
    localStorage.setItem("token", response.token);
    localStorage.setItem("user", JSON.stringify(response.user));
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error("User not registered. Please sign up first.");
    }
    console.error("Login failed:", error);
    throw new Error("Échec de la connexion");
  }
}

export async function createUser(userData) {
  try {
    const response = await signUp(userData)
    console.log("User created:", response.data);
  } catch (error: any) {
    console.error("Error signing up:", error);
  }
}

export function logoutFromKeycloak() {
  localStorage.removeItem("token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("id_token");
}
