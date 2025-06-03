import { defineStore } from 'pinia'
import consumptionsApi from '@/api/consumptions'

export const useConsumptionsStore = defineStore('consumptions', {
  state: () => ({
    latestReading: null,
    periodComparison: null,
    similarHouses: null,
    devicesComparison: null,
    loading: false,
    error: null,
    consumptionHistory: [],
  }),

  actions: {
    async fetchLatestReading() {
      this.loading = true;
      this.error = null;
      try {
        const response = await consumptionsApi.getLatestReading();
        console.log('fetchLatestReading response:', response.data);
        this.latestReading = response.data;
      } catch (err) {
        console.error('fetchLatestReading error:', err);
        this.error = err.response?.data?.message || err.message || 'Error fetching latest reading';
      } finally {
        this.loading = false;
      }
    },

  async fetchConsumptionHistory(limit = 8) {
    this.loading = true;
    this.error = null;
    try {
      const response = await consumptionsApi.getConsumptionHistory(limit);      
      this.consumptionHistory = response.data.slice().reverse().map(item => parseFloat(item.consumption_value));

    } catch (err) {
      console.error('fetchConsumptionHistory error:', err);
      this.error = err.response?.data?.message || err.message || 'Error fetching consumption history';

    } finally {
      this.loading = false;
    }
  },

    async fetchPeriodComparison(period) {
      this.loading = true;
      this.error = null;
      try {
        const response = await consumptionsApi.getPeriodComparison(period);
        console.log('fetchPeriodComparison response:', response.data);

        // Transformar dado para o formato esperado (apenas para teste)
        this.periodComparison = {
          lastPeriod: parseFloat(response.data.avg_consumption) * 0.9,  // exemplo lastPeriod 10% menor
          currentPeriod: parseFloat(response.data.avg_consumption)
        };
      } catch (err) {
        console.error('fetchPeriodComparison error:', err);
        this.error = err.response?.data?.message || err.message || 'Error fetching period comparison';
      } finally {
        this.loading = false;
      }
    },

    async fetchSimilarHouses() {
      this.loadingSimilarHouses = true;
      this.errorSimilarHouses = null;
      try {
        const response = await consumptionsApi.getSimilarHouses();
        this.similarHouses = response.data;
      } catch (err) {
        this.errorSimilarHouses = err.response?.data?.message || err.message || 'Error fetching similar houses';
      } finally {
        this.loadingSimilarHouses = false;
      }
    },

},

  getters: {
    hasError: (state) => !!state.error,
    isLoading: (state) => state.loading,
    isLoadingSimilarHouses: (state) => state.loadingSimilarHouses,
    hasErrorSimilarHouses: (state) => !!state.errorSimilarHouses,
  }
})
