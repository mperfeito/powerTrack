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

    async fetchAllPeriodComparisons() {
      this.loading = true;
      this.error = null;
      try {
        const [daily, weekly, monthly] = await Promise.all([
          consumptionsApi.getPeriodComparison('day'),
          consumptionsApi.getPeriodComparison('week'),
          consumptionsApi.getPeriodComparison('month')
        ]);
        
        this.periodComparison = {
          daily: parseFloat(daily.data.avg_consumption),
          weekly: parseFloat(weekly.data.avg_consumption),
          monthly: parseFloat(monthly.data.avg_consumption),
          currentPeriod: this.periodComparison?.currentPeriod || 0 // Mantém o atual se já existir
        };
        
      } catch (err) {
        console.error('fetchAllPeriodComparisons error:', err);
        this.error = err.response?.data?.message || err.message || 'Error fetching period comparisons';
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