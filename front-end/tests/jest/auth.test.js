import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '../../src/stores/authStore';
import usersApi from '../../src/api/users';

jest.mock('../../src/api/users');

describe('Auth Store', () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useAuthStore();
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('login', () => {
    const mockCredentials = {
      email: 'ana@example.com',
      password: 'securePassword456'
    };

    const mockToken = 'new-mock-token-xyz';
    const mockUser = {
      id: 2,
      first_name: 'Ana',
      last_name: 'Silva',
      email: 'ana@example.com',
      phone_number: '923456789',
      nif: '987654321',
      is_admin: 1
    };

    it('deve fazer login com sucesso', async () => {
      // Mock das respostas da API
      usersApi.login.mockResolvedValue({ 
        data: { 
          token: mockToken
        } 
      });
      
      usersApi.getAuthUser.mockResolvedValue({ 
        data: mockUser 
      });

      const result = await store.login(mockCredentials);

      expect(store.token).toBe(mockToken);
      expect(store.user).toEqual(mockUser);
      expect(result).toBe(true);
      expect(usersApi.login).toHaveBeenCalledWith(mockCredentials);
      expect(usersApi.getAuthUser).toHaveBeenCalled();
    });
  });
});