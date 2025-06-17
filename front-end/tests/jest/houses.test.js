import { setActivePinia, createPinia } from 'pinia';
import { useHousesStore } from '@/stores/housesStore';
import { housesApi } from '@/api/houses';

jest.mock('@/api/houses');

describe('Houses Store', () => {
  let store;

  beforeEach(() => {
    // Cria uma nova instância do Pinia antes de cada teste
    setActivePinia(createPinia());
    store = useHousesStore();
    
    // Limpa todos os mocks antes de cada teste
    jest.clearAllMocks();
  });

  describe('State', () => {
    it('should initialize with default values', () => {
      expect(store.houses).toEqual([]);
      expect(store.activeHouseId).toBeNull();
      expect(store.loading).toBe(false);
      expect(store.error).toBeNull();
    });
  });

  describe('Actions', () => {
    const mockHouses = [{ id: 1, name: 'Casa 1' }, { id: 2, name: 'Casa 2' }];
    const mockActiveHouse = { id_house: 1 };

    describe('fetchHouses', () => {
      it('should fetch houses and update state', async () => {
        housesApi.getAllHouses.mockResolvedValue({ data: mockHouses });
        
        await store.fetchHouses();
        
        expect(store.houses).toEqual(mockHouses);
        expect(store.loading).toBe(false);
        expect(store.error).toBeNull();
      });

      it('should handle error when fetching houses fails', async () => {
        const errorMessage = 'Network Error';
        housesApi.getAllHouses.mockRejectedValue(new Error(errorMessage));
        
        await store.fetchHouses();
        
        expect(store.houses).toEqual([]);
        expect(store.error).toBe(errorMessage);
        expect(store.loading).toBe(false);
      });
    });

    describe('createHouse', () => {
      it('should create a new house and refresh the list', async () => {
        const newHouse = { name: 'Nova Casa' };
        housesApi.createHouse.mockResolvedValue({});
        housesApi.getAllHouses.mockResolvedValue({ data: mockHouses });
        
        await store.createHouse(newHouse);
        
        expect(housesApi.createHouse).toHaveBeenCalledWith(newHouse);
        expect(housesApi.getAllHouses).toHaveBeenCalled();
        expect(store.houses).toEqual(mockHouses);
      });
    });
  });
});