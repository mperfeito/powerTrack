import { mount } from '@vue/test-utils'
import Sidebar from '../../src/components/Sidebar.vue'
import { vi } from 'vitest'

vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => ({
    clearAuth: vi.fn(() => Promise.resolve())
  })
}))

const pushMock = vi.fn()

const global = {
  mocks: {
    $router: {
      push: pushMock
    }
  },
  stubs: {
    'router-link': {
      template: '<a><slot /></a>'
    }
  }
}

describe('Sidebar.vue', () => {
  it('chama logout corretamente e redireciona para /login', async () => {
    const wrapper = mount(Sidebar, { global })

    await wrapper.vm.logout()

    expect(pushMock).toHaveBeenCalledWith('/login')
  }) 
  it('vai para o dashboard /dashboard', async () => {
    const wrapper = mount(Sidebar, { global })

    wrapper.vm.navigateTo('/dashboard')
  
    expect(pushMock).toHaveBeenCalledWith('/dashboard')
  }
  )
})
