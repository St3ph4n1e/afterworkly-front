import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ParticipantListComponent from '@/assets/vue/components/ParticipantListComponent/ParticipantListComponent.vue'

describe('ParticipantListComponent.vue', () => {
  it('affiche le username et la photo si présents', () => {
    const wrapper = mount(ParticipantListComponent, {
      props: {
        participantInfos: {
          username: 'Jean Dupont',
          photo: 'https://example.com/avatar.jpg'
        }
      }
    })

    expect(wrapper.text()).toContain('Jean Dupont')

    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('https://example.com/avatar.jpg')
    expect(img.attributes('alt')).toBe('Avatar')
  })

  it('n’affiche pas d’image si la photo n’est pas définie', () => {
    const wrapper = mount(ParticipantListComponent, {
      props: {
        participantInfos: {
          username: 'Alice'
          // pas de photo
        }
      }
    })

    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.text()).toContain('Alice')
  })

  it('n’affiche rien si username est absent', () => {
    const wrapper = mount(ParticipantListComponent, {
      props: {
        participantInfos: {
          photo: 'https://example.com/avatar.jpg'
        }
      }
    })

    expect(wrapper.text()).not.toContain('Jean Dupont')
    expect(wrapper.find('p').exists()).toBe(false)
  })
})
