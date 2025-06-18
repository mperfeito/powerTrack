import { setActivePinia, createPinia } from 'pinia'
import { useConsumptionsStore } from '@/stores/consumptionsStore'
import consumptionsApi from '@/api/consumptions.js'

jest.mock('@/api/consumptions.js')

describe('Consumptions Store', () => {
  let store

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useConsumptionsStore()
    jest.clearAllMocks()
  })

  describe('fetchLatestReading', () => {
    it('should fetch and store latest reading', async () => {
      await store.fetchLatestReading()
      
      expect(consumptionsApi.getLatestReading).toHaveBeenCalled()
      expect(store.latestReading).toEqual({
        consumption_value: 150.5,
        reading_date: '2024-01-01T00:00:00Z'
      })
    })
  })

  // Adicione os outros testes conforme mostrado anteriormente
  // (fetchConsumptionHistory, fetchAllPeriodComparisons, etc)
})