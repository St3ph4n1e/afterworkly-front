import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000, 
  headers: { 'Content-Type': 'application/json' },
});

// Ajout du token JWT aux en-têtes des requêtes si présent dans localStorage
apiClient.interceptors.request.use((config) => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser); // Convertit la chaîne JSON en objet
      if (parsedUser.token) {
        config.headers.Authorization = `Bearer ${parsedUser.token}`;
      }
    } catch (error) {
      console.error('Erreur de parsing du token depuis localStorage:', error);
    }
  } else {
    console.warn('Aucun utilisateur connecté trouvé dans localStorage.');
  }
  return config;
});



// Gestion centralisée des réponses
apiClient.interceptors.response.use(
  (response) => response, // Passe la réponse si elle est valide
  async (error) => {
    // Vérifier si l'erreur est due à un JWT expiré
    if (error.response?.status === 401 && error.response.data.details === 'jwt expired') {
      try {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
          throw new Error('Utilisateur non connecté.');
        }

        const parsedUser = JSON.parse(storedUser);

        // Appeler la route /auth/refresh pour obtenir un nouveau token
        const refreshResponse = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh`, null, {
          headers: { Authorization: `Bearer ${parsedUser.token}` },
        });

        const newToken = refreshResponse.data.token;

        // Mettre à jour le token dans localStorage
        parsedUser.token = newToken;
        localStorage.setItem('user', JSON.stringify(parsedUser));

        // Réessayer la requête initiale avec le nouveau token
        error.config.headers.Authorization = `Bearer ${newToken}`;
        return apiClient.request(error.config);
      } catch (refreshError) {
        console.error('Erreur lors du rafraîchissement du token :', refreshError.message);

        // Si le refresh échoue, déconnecter l'utilisateur
        localStorage.removeItem('user');
        window.location.href = '/auth';
      }
    }

    // Si ce n'est pas une erreur liée au JWT, rejeter l'erreur
    return Promise.reject(error);
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

// Méthodes spécifiques aux API

// Authentification
export async function signUp(userData: { name: string; email: string; password: string }) {
  const response = await apiClient.post('/signup', userData);
  return response.data;
}

export async function login(userData: { email: string; password: string }) {
  const response = await apiClient.post('/login', userData);
  console.debug('Réponse après connexion :', response.data);
  localStorage.setItem('token', response.data.token); // Stocke le token
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

export async function getEvents(params?: { page?: number; limit?: number }) {
  const response = await apiClient.get('/events', { params });
  return response.data;
}

export async function getEventById(eventId: string) {
  const response = await apiClient.get(`/events/${eventId}`);
  return response.data;
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

export async function deleteEvent(eventId: string) {
  const response = await apiClient.delete(`/events/${eventId}`);
  return response.data;
}

// Profil utilisateur
export async function getUserProfile() {
  const response = await apiClient.get('/profile');
  return response.data;
}

export async function updateUserProfile(updatedData: Record<string, any>) {
  const response = await apiClient.put('/profile', updatedData);
  return response.data;
}

export async function updateUserAvatar(file: File) {
  const formData = new FormData();
  formData.append('avatar', file);

  const response = await apiClient.post('/profile/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}
