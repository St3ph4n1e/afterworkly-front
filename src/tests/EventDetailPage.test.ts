import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import EventDetailPage from '@/assets/vue/pages/EventDetailPage/EventDetailPage.vue'
import * as api from '@/axios/api'

// Déclaration d'un ID créateur, d'un ID d'utilisateur lambda, et d'un ID d'utilisateur participant
 // ID d'un utilisateur créateur d'événement
const CREATOR_ID = '607d1f77bcf86cd799439011'
// ID d'un utilisateur qui n'est pas le créateur de l'événement
const NON_CREATOR_ID = '607d1f77bcf86cd799439012'
// ID d'un utilisateur participant à l'événement
const PARTICIPANT_ID = '607d1f77bcf86cd799439013'

// Mock de la vue-router pour simuler la récupération de l'ID de l'événement via la route
vi.mock('vue-router', () => ({
  // Simule l'ID de l'événement dans la route
  useRoute: vi.fn(() => ({ params: { id: '7' } })),
  // Simule la méthode de navigation
  useRouter: vi.fn(() => ({ push: vi.fn() }))
}))

// Mock des appels aux API pour simuler leur comportement dans les tests
vi.mock('@/axios/api', () => ({
  // Simule la récupération des détails d'un événement
  getEventById: vi.fn(),
  // Simule le changement de statut de participation
  toggleParticipantStatus: vi.fn(),
  // Simule la suppression d'un événement
  deleteEvent: vi.fn(),
  // Simule la mise à jour d'un événement
  updateEvent: vi.fn()
}))

// Déclaration des composants globaux à inclure dans les tests
const globalComponents = {
  components: {
    HeaderComponent: { template: '<div />' },
    FooterComponent: { template: '<div />' },
    NotificationComponent: { template: '<div />' },
    ModalComponent: { template: '<div />' },
    ParticipantListComponent: { template: '<div />' }
  }
}

// Déclaration de l'événement simulé pour les tests
const mockEvent = {
  _id: '7', // ID de l'événement
  id: '7', // ID de l'événement (utilisé aussi pour la route)
  title: 'Événement test', // Titre de l'événement
  date: '2025-04-09', // Date de l'événement
  time: '18:00', // Heure de l'événement
  location: 'Paris', // Lieu de l'événement
  description: 'Un événement de test', // Description de l'événement
  creator: CREATOR_ID, // ID du créateur de l'événement
  isPublic: true, // Indicateur de visibilité de l'événement
  color: '#f9f9f9', // Couleur associée à l'événement
  participants: [PARTICIPANT_ID], // Liste des participants (incluant un participant)
  image: 'test-image.jpg' // Image de l'événement
}

// Début des tests pour la page de détail de l'événement, spécifiquement pour la gestion des permissions
describe('EventDetailPage.vue - Permissions', () => {

  // Avant chaque test, réinitialiser les mocks et simuler l'API qui récupère les événements
  beforeEach(() => {
    vi.resetAllMocks()
    // Simule la réponse de l'API avec l'événement mocké
    vi.mocked(api.getEventById).mockResolvedValue(mockEvent)
  })


  it('n\'affiche pas le bouton "Modifier" si l\'utilisateur n\'est pas le créateur', async () => {
    // Simulation du stockage de session pour un utilisateur qui n'est pas le créateur
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: vi.fn((key) => {
          if (key === 'user') {
            return JSON.stringify({ _id: NON_CREATOR_ID, name: 'Utilisateur Test' }) // Utilisateur non créateur
          }
          return null
        })
      },
      writable: true
    })

    // Montage du composant avec les composants globaux
    const wrapper = mount(EventDetailPage, {
      global: globalComponents
    })

    // Attente que les promesses asynchrones soient résolues
    await flushPromises()

    // Vérification que les boutons "Modifier" et "Supprimer" n'existent pas
    expect(wrapper.find('button[title="Modifier l\'événement"]').exists()).toBe(false)
    expect(wrapper.find('button[title="Supprimer l\'événement"]').exists()).toBe(false)
    expect(wrapper.find('button[title="Bouton qui n\'existe pas"]').exists()).toBe(false)
  })

  it('Affiche le bouton "Modifier" si l\'utilisateur est le créateur de l\'événement', async () => {
    // Simulation du stockage de session pour un utilisateur créateur
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: vi.fn((key) => {
          if (key === 'user') {
            return JSON.stringify({ _id: CREATOR_ID, name: 'Créateur Test' }) // Utilisateur créateur
          }
          return null
        })
      },
      writable: true
    })

    const wrapper = mount(EventDetailPage, {
      global: globalComponents
    })

    await flushPromises()

    // Vérification que le bouton "Modifier" est visible et que les autres boutons sont absents
    expect(wrapper.find('button[title="Modifier l\'événement"]').exists()).toBe(true)
    expect(wrapper.find('button[title="Bouton qui n\'existe pas"]').exists()).toBe(false)
    expect(wrapper.find('button[title="Envoyer une invitation"]').exists()).toBe(true)
  })

  it('Affiche le bouton "Modifier" si l\'utilisateur est un participant de l\'événement', async () => {
    // Simulation du stockage de session pour un utilisateur participant
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem: vi.fn((key) => {
          if (key === 'user') {
            return JSON.stringify({ _id: PARTICIPANT_ID, name: 'Participant Test' }) // Utilisateur participant
          }
          return null
        })
      },
      writable: true
    })

    const wrapper = mount(EventDetailPage, {
      global: globalComponents
    })

    await flushPromises()

    // Vérification que le bouton "Modifier" n'est pas affiché pour un participant
    expect(wrapper.find('button[title="Modifier l\'événement"]').exists()).toBe(false)
    expect(wrapper.find('button[title="Supprimer l\'événement"]').exists()).toBe(false)
    expect(wrapper.find('button[title="Bouton qui n\'existe pas"]').exists()).toBe(false)
  })
})
