import { defineStore } from 'pinia'
import appliancesApi from '@/api/appliances' 

export const useAppliancesStore = defineStore('appliances', {
  state: () => ({
    appliances: [], 
    selectedAppliance: null, 
    loading: false,
    error: null,
  }),

  actions: {
    async fetchAppliances() {
      this.loading = true
      this.error = null
      try {
        const response = await appliancesApi.getAppliances()
        this.appliances = response.data
      } catch (err) {
        this.error = err
      } finally {
        this.loading = false
      }
    },

    async fetchApplianceById(id) {
      this.loading = true
      this.error = null
      try {
        const response = await appliancesApi.getAppliancesById(id)
        this.selectedAppliance = response.data
      } catch (err) {
        this.error = err
      } finally {
        this.loading = false
      }
    },

    async createAppliance(applianceData) {
      this.loading = true
      this.error = null
      try {
        await appliancesApi.createAppliance(applianceData)
        await this.fetchAppliances()
      } catch (err) {
        this.error = err
      } finally {
        this.loading = false
      }
    },

        async updateAppliance(applianceData) {
        this.loading = true;
        this.error = null;
        try {
            // ⚠️ Ajusta este endpoint ao que tens no teu backend (ex.: PUT /api/appliances/:id)
            await appliancesApi.updateAppliance(applianceData.id, applianceData);
            await this.fetchAppliances();
        } catch (err) {
            this.error = err;
        } finally {
            this.loading = false;
        }
        },


    async deleteAppliance(id) {
      this.loading = true
      this.error = null
      try {
        await appliancesApi.deleteAppliance(id)
        await this.fetchAppliances()
      } catch (err) {
        this.error = err
      } finally {
        this.loading = false
      }
    }
  },

  getters: {
    hasError: (state) => !!state.error,
    isLoading: (state) => state.loading,
    appliancesCount: (state) => state.appliances.length,
  }
})
