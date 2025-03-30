import axios from 'axios';
import { logoutUser } from '@/auth/authservice.ts'
import type { User } from '@/assets/vue/types/types.ts'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Function to refresh the access token
async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) {
    console.error("No refresh token available. Logging out.");
    logoutUser();
    return null;
  }

  try {
    const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh`, {
      refresh_token: refreshToken,
    });

    // Store new tokens
    sessionStorage.setItem("access_token", response.data.access_token);
    localStorage.setItem("refresh_token", response.data.refresh_token);

    return response.data.access_token;
  } catch (error) {
    console.error("Token refresh failed, logging out user.", error);
    logoutUser();
    return null;
  }
}

// Axios request interceptor to attach the access token
apiClient.interceptors.request.use(async (config) => {
  const token = sessionStorage.getItem("access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


// Axios response interceptor to handle token expiration
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {

    const originalRequest = error.config;

    if (error.response?.status === 401 || error.response?.status === 403) {
      console.error(error.response?.data?.message )
      const errorMsg = error.response?.data?.message ||  error.response?.data?.error_description || "";

      // todo axe d'amelioration : peut-être faire le refresh direct depuis le back si token expired
      //  plutot que de renvoyer une requête refresh depuis fornt
      if (errorMsg.includes("Invalid or expired token") || errorMsg.includes("expired token")) {
        console.warn("Access token expired. Refreshing token...");
        const newAccessToken = await refreshAccessToken();
        if (newAccessToken) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient.request(originalRequest); // Retry the failed request
        }
      } else {
        console.warn("Unauthorized: Not an expired token issue.");
      }
    }

    if (!error.response) {
      console.error("Erreur de connexion réseau.", error);
      // Afficher la notification pour avertir l'utilisateur
      return Promise.reject(new Error("Vous n'êtes pas connecté à Internet"));
    }

    return Promise.reject(error.response?.data || error.message);
  }
);


// Debugging en mode développement
if (import.meta.env.MODE === 'development') {
  apiClient.interceptors.request.use((config) => {
    console.debug('Request:', config);
    return config;
  });
  apiClient.interceptors.response.use((response) => {
    console.debug('Response:', response);
    return response;
  });
}

export default apiClient;



// Exemple d'export de fonctions pour des API spécifiques
export async function signUp(userData: User) {
  const response = await apiClient.post('/auth/signup', userData);
  return response;
}

export async function login(userData: { mail: string; password: string }) {
  const response = await apiClient.post('/auth/login', userData);
  return response.data;
}

// Événements
export async function createEvent(eventData: FormData) {
  const response = await apiClient.post('/events', eventData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

/*export async function getEvents() {
  const response = await apiClient.get('/events')
  return response.data
}*/
export async function getEvents(params?: { page?: number; limit?: number }) {
  const response = await apiClient.get('/events', { params });
  return response.data;
}

export async function getEventById(eventId: string) {
  const response = await apiClient.get(`/events/${eventId}`);
  return response.data;
}

export async function updateEvent(eventId: string, updatedData: FormData | Record<string, unknown>) {
  const response = await apiClient.put(`/events/${eventId}`, updatedData, {
    headers: updatedData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
  });
  return response.data;
}

export async function toggleParticipantStatus(eventId: string, participantData: { userId: string; status: string }) {
  const response = await apiClient.post(`/events/${eventId}/participants`, participantData);
  return response.data;
}

export async function deleteEvent(eventId: string) {
  const response = await apiClient.delete(`/events/${eventId}`);
  return response.data;
}


// Profil utilisateur
export async function getUserProfile() {
  const response = await apiClient.get('/auth/profile');
  console.log(response.data)
  return response.data;
}

export async function updateUserProfile(updatedData: Record<string, unknown>) {
  const response = await apiClient.put('/auth/profile', updatedData);
  return response.data;
}

export async function updateUserAvatar(file: File) {
  const formData = new FormData();
  formData.append('avatar', file);

  const response = await apiClient.post('/auth/profile/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function getUserInfo(id: string) {
  const response = await apiClient.get('/auth/' + id)
  return response.data
}
