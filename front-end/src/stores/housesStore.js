import { defineStore } from 'pinia';
import housesApi from '@/api/houses';
// import appliancesApi from '@/api/appliances' 


export const useHousesStore = defineStore('house', {
  state: () => ({
    houses: [],
    activeHouseId: null,
    loading: false,
    error: null,
  }),

  actions: {
    async fetchHouses() {
      this.loading = true;
      try {
        const { data } = await housesApi.getAllHouses();
        this.houses = data;
      } catch (err) {
        this.error = err.message || 'Error fetching houses';
      } finally {
        this.loading = false;
      }
    },

    async fetchActiveHouse() {
      this.loading = true;
      try {
        const { data } = await housesApi.getActiveHouse();
        this.activeHouseId = data.id_house;
      } catch (err) {
        this.error = err.message || 'Error fetching active house';
      } finally {
        this.loading = false;
      }
    },

    async createHouse(houseData) {
      try {
        await housesApi.createHouse(houseData);
        await this.fetchHouses();
      } catch (err) {
        this.error = err.message || 'Error creating house';
      }
    },

    async updateHouse(id, houseData) {
      try {
        await housesApi.updateHouse(id, houseData);
        await this.fetchHouses();
      } catch (err) {
        this.error = err.message || 'Error updating house';
      }
    },

    async deleteHouse(id) {
      try {
        await housesApi.deleteHouse(id);
        await this.fetchHouses();
      } catch (err) {
        this.error = err.message || 'Error deleting house';
      }
    },

    async setActiveHouse(id) {
      try {
        await housesApi.setActiveHouse(id);
        this.activeHouseId = id;
      } catch (err) {
        this.error = err.message || 'Error setting active house';
      }
    }
  }
});
