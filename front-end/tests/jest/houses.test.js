import { setActivePinia, createPinia } from 'pinia';
import { useHousesStore } from '../../src/stores/housesStore';
import housesApi from '../../src/api/houses';

jest.mock('../../src/api/houses');

describe('Houses Store', () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useHousesStore();
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

  describe('fetchHouses', () => {
    it('should fetch houses successfully', async () => {
      const mockHouses = [{ id: 1, name: 'Casa 1' }];
      housesApi.getAllHouses.mockResolvedValue({ data: mockHouses });
      
      await store.fetchHouses();
      
      expect(store.houses).toEqual(mockHouses);
      expect(store.loading).toBe(false);
      expect(housesApi.getAllHouses).toHaveBeenCalled();
    });
  });
});