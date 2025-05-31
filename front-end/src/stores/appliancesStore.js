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

    // Fetch Appliances
    async fetchAppliances() {
    this.loading = true;
    try {
        const response = await appliancesApi.getAllAppliances();
        this.appliances = response.data.appliances || response.data;
        console.log("Dados recebidos:", this.appliances);
    } catch (err) {
        console.error("Erro ao buscar appliances:", err);
    } finally {
        this.loading = false;
    }
    },

    // Create a New Appliance
async createAppliance(applianceData) {
  this.loading = true;
  this.error = null;

  try {
    const response = await appliancesApi.createAppliance({
      type: applianceData.type,
      state: applianceData.state,
      avg_operating_hours: +applianceData.avg_operating_hours,
      nominal_power_watts: +applianceData.nominal_power_watts
    });

    await this.fetchAppliances();
    return response;

  } catch (err) {
    this.error = err.response?.status === 409
      ? `Já existe um aparelho com o tipo "${applianceData.type}"`
      : err.response?.data?.errorMessage || "Erro ao criar aparelho";
    throw err;
  } finally {
    this.loading = false;
  }
},

  // Update Appliance
async updateAppliance(applianceData) {
  this.loading = true;
  this.error = null;
  try {
    const payload = {
      type: applianceData.type,
      state: applianceData.state,
      avg_operating_hours: +applianceData.avg_operating_hours,
      nominal_power_watts: +applianceData.nominal_power_watts
    };

    await appliancesApi.updateAppliance(applianceData.id, payload);

    await this.fetchAppliances();
  } catch (err) {
    this.error = err.response?.status === 409
      ? `Já existe um aparelho com o tipo "${applianceData.type}"`
      : err.response?.data?.errorMessage || err.message;
    throw err;
  } finally {
    this.loading = false;
  }
},


  // Delete Appliance
async deleteAppliance(id) {
  if (!id) {
    throw new Error("ID inválido para exclusão");
  }

  this.loading = true;
  this.error = null;
  
  try {
    await appliancesApi.deleteAppliance(id);
    // Remove localmente sem recarregar tudo
    this.appliances = this.appliances.filter(a => a.id !== id);
  } catch (err) {
    this.error = err.response?.data?.errorMessage || err.message;
    console.error("Erro na exclusão:", {
      id,
      status: err.response?.status,
      data: err.response?.data
    });
    throw err;
  } finally {
    this.loading = false;
  }
}},


  getters: {
    hasError: (state) => !!state.error,
    isLoading: (state) => state.loading,
    appliancesCount: (state) => state.appliances.length,
  }
})
