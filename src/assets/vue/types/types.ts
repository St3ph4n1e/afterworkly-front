// Interface pour un participant à un événement
export interface EventParticipant {
  userId: string; // Identifiant utilisateur
  name: string; // Nom du participant
  status: 'Confirmé' | 'Indécis' | string; // Statut du participant
  avatar?: string | null; // Avatar optionnel
}




// Interface pour un événement
export interface Event {
  id: string; // Identifiant unique de l'événement (string pour MongoDB)
  title: string; // Titre de l'événement
  date: string; // Date de l'événement
  time: string; // Heure de l'événement
  description?: string; // Description de l'événement (optionnelle)
  location: string; // Lieu de l'événement
  image?: string | null; // Image de l'événement (optionnelle)
  color: string; // Couleur associée à l'événement
  creator: string; // Identifiant du créateur de l'événement
  participants: EventParticipant[]; // Liste des participants
  isPublic: boolean; // Visibilité de l'événement
}
