export default {
    getLatestReading: jest.fn().mockResolvedValue({ 
      data: { 
        consumption_value: 150.5,
        reading_date: '2024-01-01T00:00:00Z'
      } 
    }),
    getConsumptionHistory: jest.fn().mockResolvedValue({ 
      data: [
        { consumption_value: '120.5', reading_date: '2024-01-01' },
        { consumption_value: '130.2', reading_date: '2024-01-02' }
      ] 
    }),
    getPeriodComparison: jest.fn()
      .mockImplementation((period) => {
        const data = {
          day: { avg_consumption: '140.0' },
          week: { avg_consumption: '135.0' },
          month: { avg_consumption: '125.0' }
        }
        return Promise.resolve({ data: data[period] })
      }),
    getSimilarHouses: jest.fn().mockResolvedValue({ 
      data: [
        { id: 1, consumption: 145.0 },
        { id: 2, consumption: 155.0 }
      ] 
    })
  }