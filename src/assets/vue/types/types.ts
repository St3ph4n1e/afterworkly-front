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
