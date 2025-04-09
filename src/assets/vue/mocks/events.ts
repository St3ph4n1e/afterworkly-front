class MockObjectId {
  constructor(public value: string) {}

  toString() {
    return this.value;
  }
}

export const mockEvents = [
  {
    id: 1,
    title: 'Afterwork du Vendredi',
    date: new Date('2024-12-20'),
    description: 'Une soirée conviviale pour échanger entre collègues et amis.',
    location: 'Café de Paris',
    image: '/src/assets/images/event1.jpeg',
    color: '#FF5733',
    participants: [
      { name: 'Jean', status: 'Confirmé', avatar: '/src/assets/images/jean-avatar.jpeg' },
      { name: 'Marie', status: 'Indécis', avatar: '/src/assets/images/default-avatar.png' },
    ],
    creator: new MockObjectId('67f649c96144c8f4838cafdc')
  },
  {
    id: 2,
    title: 'Afterwork du Lundi',
    date: new Date('2024-12-18'),
    description: 'Un moment pour discuter entre collègues après un début de semaine chargé.',
    location: 'Bar Le Coco',
    image: '/src/assets/images/event2.jpeg',
    color: '#33C3FF',
    participants: [
      { name: 'Alice', status: 'Confirmé', avatar: '/src/assets/images/alice-avatar.jpeg' },
      { name: 'Bob', status: 'Indécis', avatar: null },
    ],
    creator: new MockObjectId('5a4d5f5a5d63c9b416ef27b8')
  },
  {
    id: 3,
    title: 'Afterwork du Mercredi',
    date: new Date('2024-12-22'),
    description: 'Rejoignez-nous pour une ambiance détendue et des conversations agréables.',
    location: 'Terrasse 360',
    image: null,
    color: '#6C757D',
    participants: [
      { name: 'Clara', status: 'Confirmé', avatar: null },
      { name: 'Tom', status: 'Indécis', avatar: '/src/assets/images/tom-avatar.png' },
    ],
    creator: new MockObjectId('67f649c96144c8f4838cafdc')
  },
  {
    id: 4,
    title: 'Team Building',
    date: new Date('2025-01-15'),
    description: 'Un événement incontournable pour découvrir les innovations de l’année.',
    location: 'Salle de conférence A',
    image: '/src/assets/images/event4.jpeg',
    color: '#FFC300',
    participants: [
      { name: 'Emma', status: 'Confirmé', avatar: '/src/assets/images/emma-avatar.png' },
      { name: 'Liam', status: 'Indécis', avatar: null },
    ],
    creator: new MockObjectId('5a4d5f5a5d63c9b416ef27b8')
  },
  {
    id: 5,
    title: 'Réunion mensuelle',
    date: new Date('2025-01-10'),
    description: 'Un événement incontournable pour découvrir les innovations de l’année.',
    location: 'Salle B',
    image: null,
    color: '#007BFF',
    participants: [
      { name: 'Sophie', status: 'Confirmé', avatar: '/src/assets/images/sophie-avatar.png' },
      { name: 'Lucas', status: 'Indécis', avatar: '/src/assets/images/lucas-avatar.jpegnina' },
    ],
    creator: new MockObjectId('67f649c96144c8f4838cafdc')
  },
  {
    id: 6,
    title: 'Présentation de projet',
    date: new Date('2025-02-05'),
    description: 'Présentation des nouvelles fonctionnalités du projet en cours.',
    location: 'Salle de réunion 2',
    image: '/src/assets/images/event6.jpeg',
    color: '#FF6347',
    participants: [
      { name: 'Nina', status: 'Confirmé', avatar: '/src/assets/images/nina-avatar.jpeoscag' },
      { name: 'Oscar', status: 'Indécis', avatar: '/src/assets/images/oscar-avatar.png' },
    ],
    creator: new MockObjectId('5a4d5f5a5d63c9b416ef27b8')
  },
  {
    id: 7,
    title: 'Atelier créatif',
    date: new Date('2025-02-12'),
    description: 'Un atelier pour libérer votre créativité et collaborer en équipe.',
    location: 'Studio Créatif',
    image: null,
    color: '#8A2BE2',
    participants: [
      { name: 'Paul', status: 'Confirmé', avatar: null },
      { name: 'Sarah', status: 'Indécis', avatar: '/src/assets/images/sarah-avatar.jpeg' },
    ],
    creator: new MockObjectId('67f649c96144c8f4838cafdc')
  },
  {
    id: 8,
    title: 'Soirée jeux',
    date: new Date('2025-02-19'),
    description: 'Une soirée ludique pour renforcer les liens entre collègues.',
    location: 'Salle de détente',
    image: '/src/assets/images/event8.jpeg',
    color: '#FFD700',
    participants: [
      { name: 'Anna', status: 'Confirmé', avatar: '/src/assets/images/anna-avatar.jpeg' },
      { name: 'Boris', status: 'Indécis', avatar: null },
    ],
    creator: new MockObjectId('5a4d5f5a5d63c9b416ef27b8')
  },
  {
    id: 9,
    title: 'Conférence annuelle',
    date: new Date('2025-03-25'),
    description:  'Un événement incontournable pour découvrir les innovations de l’année.',
    location: 'Auditorium principal',
    image: '/src/assets/images/event9.jpeg',
    color: '#00CED1',
    participants: [
      { name: 'Victor', status: 'Confirmé', avatar: '/src/assets/images/victor-avatar.jpeg' },
      { name: 'Julia', status: 'Indécis', avatar: '/src/assets/images/julia-avatar.jpeg' },
    ],
    creator: new MockObjectId('67f649c96144c8f4838cafdc')
  },
  {
    id: 10,
    title: 'Afterwork Bowling',
    date: new Date('2025-04-07'),
    description: 'Un moment de détente autour du bowling avec vos collègues.',
    location: 'Bowling Center',
    image: null,
    color: '#2E8B57',
    participants: [
      { name: 'Eve', status: 'Confirmé', avatar: null },
      { name: 'Adam', status: 'Indécis', avatar: '/src/assets/images/adam-avatar.jpegchloe' },
    ],
    creator: new MockObjectId('5a4d5f5a5d63c9b416ef27b8')
  },
  {
    id: 11,
    title: 'Petit-déjeuner collaboratif',
    date: new Date('2025-04-15'),
    description: 'Un petit-déjeuner pour partager idées et expériences.',
    location: 'Cafétéria',
    image: '/src/assets/images/event11.jpeg',
    color: '#FF4500',
    participants: [
      { name: 'Chloe', status: 'Confirmé', avatar: '/src/assets/images/chloe-avatar.jpeg' },
      { name: 'Elliot', status: 'Indécis', avatar: '/src/assets/images/elliot-avatar.jpeg' },
    ],
    creator: new MockObjectId('67f649c96144c8f4838cafdc')
  },
  {
    id: 12,
    title: 'Séminaire de formation',
    date: new Date('2025-04-20'),
    description: 'Développez vos compétences avec ce séminaire enrichissant.',
    location: 'Centre de formation',
    image: '/src/assets/images/event12.jpeg',
    color: '#4682B4',
    participants: [
      { name: 'Grace', status: 'Confirmé', avatar: '/src/assets/images/grace-avatar.jpeg' },
      { name: 'Henry', status: 'Indécis', avatar: '/src/assets/images/henry-avatar.jpeg' },
    ],
    creator: new MockObjectId('5a4d5f5a5d63c9b416ef27b8')
  }
]
