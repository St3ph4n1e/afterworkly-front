import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ModalComponent from '@/assets/vue/components/ModalComponent/ModalComponent.vue'

describe('ModalComponent.vue', () => {
  const defaultProps = {
    isVisible: true,
    title: 'Confirmation',
    buttons: [
      {
        text: 'Confirmer',
        action: vi.fn(),
        class: 'bg-green-500',
      },
      {
        text: 'Annuler',
        action: vi.fn(),
      },
    ],
  }

  it('affiche la modale avec le titre et les boutons', () => {
    const wrapper = mount(ModalComponent, {
      props: defaultProps,
      slots: {
        default: '<p>Êtes-vous sûr de vouloir continuer ?</p>',
      },
    })

    expect(wrapper.text()).toContain('Confirmation')
    expect(wrapper.text()).toContain('Êtes-vous sûr de vouloir continuer ?')

    const buttons = wrapper.findAll('button')
    expect(buttons).toHaveLength(2)
    expect(buttons[0].text()).toBe('Confirmer')
    expect(buttons[1].text()).toBe('Annuler')
  })

  it('exécute les actions associées aux boutons', async () => {
    const wrapper = mount(ModalComponent, {
      props: defaultProps,
    })

    const buttons = wrapper.findAll('button')

    await buttons[0].trigger('click')
    await buttons[1].trigger('click')

    expect(defaultProps.buttons[0].action).toHaveBeenCalled()
    expect(defaultProps.buttons[1].action).toHaveBeenCalled()
  })

  it('applique les classes personnalisées sur les boutons', () => {
    const wrapper = mount(ModalComponent, {
      props: defaultProps,
    })

    const confirmButton = wrapper.findAll('button')[0]
    expect(confirmButton.classes()).toContain('bg-green-500')

    const cancelButton = wrapper.findAll('button')[1]
    expect(cancelButton.classes()).toContain('bg-blue-500')
  })
})
