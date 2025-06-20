import { mount } from '@vue/test-utils'
import NotificationsView from '../../src/views/NotificationsView.vue'
import Sidebar from '../../src/components/Sidebar.vue'
import { createTestingPinia } from '@pinia/testing'
import { describe, it, expect, vi } from 'vitest'
import { useNotificationsStore } from '../../src/stores/notificationsStore' 
describe('NotificationsView.vue', () => {
  it('calls sendNotifications when clicking refresh button', async () => {
    const pinia = createTestingPinia({
      stubActions: false,
    })

    const notificationsStore = useNotificationsStore(pinia)

    const sendNotificationsMock = vi.spyOn(notificationsStore, 'sendNotifications').mockResolvedValue()

    const wrapper = mount(NotificationsView, {
      global: {
        plugins: [pinia],
        stubs: {
          Sidebar,
          'router-link': true,  
        },
      },
    })

    const buttons = wrapper.findAll('button')
    const refreshButton = buttons.find(btn => btn.text() === 'Refresh')
    
    await refreshButton.trigger('click')

    await wrapper.vm.$nextTick()

    expect(sendNotificationsMock).toHaveBeenCalled()
  })
})
