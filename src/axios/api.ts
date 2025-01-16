import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // Base URL pour vos API
  headers: {
    'Content-Type': 'application/json',
  },
});

// Ajout du token JWT aux en-têtes si présent dans le localStorage
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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



export async function getEvents() {
  const response = await apiClient.get('/events')
  return response.data
}

export async function getEventById(eventId: string) {
  const response = await apiClient.get(`/events/${eventId}`)
  return response.data
}
