import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import EventCardComponent from '@/assets/vue/components/EventCardComponent/EventCardComponent.vue'

const mockPush = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('EventCardComponent.vue', () => {
  const defaultProps = {
    id: 'abc123',
    title: 'Soirée Networking',
    isPublic: true,
    location: 'Paris',
    date: '2025-04-12',
    time: '19:00',
    image: 'https://example.com/event.jpg',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('affiche correctement les infos de l’événement', () => {
    const wrapper = mount(EventCardComponent, {
      props: defaultProps,
    })

    expect(wrapper.text()).toContain('Soirée Networking')
    expect(wrapper.text()).toContain('Public')
    expect(wrapper.text()).toContain('Paris')
    expect(wrapper.text()).toContain('12 avril 2025')
    expect(wrapper.text()).toContain('19:00')

    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe(defaultProps.image)
    expect(img.attributes('alt')).toContain(defaultProps.title)
  })

  it('redirige vers la page détail au clic sur le bouton', async () => {
    const wrapper = mount(EventCardComponent, {
      props: defaultProps,
    })

    const button = wrapper.get('button')
    await button.trigger('click')

    expect(mockPush).toHaveBeenCalledWith('/event-detail/abc123')
  })

  it('ouvre Google Maps au clic sur la localisation', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

    const wrapper = mount(EventCardComponent, {
      props: defaultProps,
    })

    const location = wrapper.get('p[title="Ouvrir la localisation dans Google Maps"]')
    await location.trigger('click')

    expect(openSpy).toHaveBeenCalledWith(
      'https://www.google.com/maps/search/?q=Paris',
      '_blank'
    )

    openSpy.mockRestore()
  })

  it('gère l’absence de titre et image avec les valeurs par défaut', () => {
    const wrapper = mount(EventCardComponent, {
      props: {
        id: 'test456',
        date: '2025-01-01',
        time: '12:00'
      }
    })

    expect(wrapper.text()).toContain('Titre indisponible')
    expect(wrapper.find('img').attributes('src')).toBe(
      'https://afterworkly-media.s3.eu-north-1.amazonaws.com/logo-afterworkly.png'
    )
  })

  it('affiche "Date invalide" si la date est incorrecte', () => {
    const wrapper = mount(EventCardComponent, {
      props: {
        ...defaultProps,
        date: 'not-a-date',
      }
    })

    expect(wrapper.text()).toContain('Date invalide')
  })
})
