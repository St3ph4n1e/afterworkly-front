import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000, 
  headers: { 'Content-Type': 'application/json' },
});

// Ajout du token JWT aux en-têtes si présent dans le localStorage
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token'); // Supprime le token si non valide
      window.location.href = '/auth'; // Redirige l'utilisateur vers le login
    }
    return Promise.reject(error.response?.data || error.message);
  }
);


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


// Gestion des erreurs
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error.response?.data || error.message);
  }
);

export default apiClient;

// Exemple d'export de fonctions pour des API spécifiques
export async function signUp(userData: { name: string; email: string; password: string }) {
  const response = await apiClient.post('/auth/signup', userData);
  return response.data;
}

export async function login(userData: { email: string; password: string }) {
  const response = await apiClient.post('/auth/login', userData);
  return response.data;
}



// Événements
export async function createEvent(eventData: FormData) {
  const response = await apiClient.post('/events', eventData, {
    headers: {
      'Content-Type': 'multipart/form-data', 
    },
  })
  return response.data
}



export async function getEvents(params?: { page?: number; limit?: number }) {
  const response = await apiClient.get('/events', { params });
  return response.data;
}


export async function getEventById(eventId: string) {
  const response = await apiClient.get(`/events/${eventId}`);
  return response.data ;
}


export async function updateEvent(eventId: string, updatedData: FormData | Record<string, any>) {
  const response = await apiClient.put(`/events/${eventId}`, updatedData, {
    headers: updatedData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
  });
  return response.data;
}

export async function toggleParticipantStatus(eventId: string, participantData: { userId: string; status: string }) {
  const response = await apiClient.post(`/events/${eventId}/participants`, participantData);
  return response.data;
}

// Suppression d'un événement
export async function deleteEvent(eventId: string) {
  const response = await apiClient.delete(`/events/${eventId}`);
  return response.data;
}


// Récupération des événements de l'utilisateur
export async function getUserEvents() {
  const response = await apiClient.get('/user-events');
  return response.data;
}




/// Récupération du profil utilisateur
export async function getUserProfile() {
  const response = await apiClient.get('/profile');
  return response.data;
}

// Mise à jour du profil utilisateur
export async function updateUserProfile(updatedData: Record<string, any>) {
  const response = await apiClient.put('/profile', updatedData);
  return response.data;
}

// Mise à jour de l'avatar utilisateur
export async function updateUserAvatar(file: File) {
  const formData = new FormData();
  formData.append('avatar', file);

  const response = await apiClient.post('/profile/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}
