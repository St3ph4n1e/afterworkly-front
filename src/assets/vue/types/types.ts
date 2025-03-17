export interface EventParticipant {
  name: string
  status: 'Confirmé' | 'Indécis'
  avatar?: string | null
}

export interface Event {
  id: number
  title: string
  date: string
  description: string
  location: string
  image: string | null
  color: string
  participants: EventParticipant[]
}

export class User {
  _id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  roles?: string[]; // Optional property
}
