// src/stores/authStore.js
import { defineStore } from 'pinia'
import api from '../api/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: null
  }),

  actions: {
    async login(credentials) {
      try {
        const response = await api.post('/login', credentials)
        this.token = response.data.token
        localStorage.setItem('token', this.token)
        await this.fetchUser()
        return true
      } catch (error) {
        this.clearAuth()
        throw error
      }
    },

    async register(userData) {
      console.log("[DEBUG] Sending registration payload:", userData); 
      try {
        const response = await api.post('/users', userData);
        console.log("[DEBUG] Registration success:", response.data); 
        this.token = response.data.token;
        localStorage.setItem('token', this.token);
        await this.fetchUser();
        return true;
      } catch (error) {
        console.error("[DEBUG] Registration failed:", error.response?.data || error.message); 
        this.clearAuth();
        throw error;
      }
    },

    async fetchUser() {
      try {
        const response = await api.get('/users/me')
        this.user = response.data
      } catch (error) {
        this.clearAuth()
        throw error
      }
    }, 

    async updatePassword(data) {
      try {
        const response = await api.patch('/users/me', {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword
        });
        return response.data;
      } catch (error) {
        throw error;
      }
    },

    clearAuth() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
    }
  },

  getters: {
    isAuthenticated: (state) => !!state.token
  }
})