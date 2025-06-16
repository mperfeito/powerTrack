// src/stores/authStore.js
import { defineStore } from 'pinia'
import api from '../api/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: null, 
    refreshKey: 0 
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.is_admin === 1 
  },

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
      try {
        const response = await api.post('/users', userData)
        return response.data
      } catch (error) {
        throw error
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
        const response = await api.patch('/users/me/password', { // Endpoint específico
          current_password: data.currentPassword,
          password: data.newPassword
        });
        return response.data;
      } catch (error) {
        console.error('Password update error:', error.response?.data);
        throw new Error(error.response?.data?.message || "Password update failed");
      }
    }, 
    async updateProfile(data) {
      try {
        // Clean the data before sending
        const cleanedData = {
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          phone_number: data.phone_number || '',
          // Explicitly exclude nif
        };
        
        const response = await api.patch('/users/me', cleanedData);
        this.user = response.data;
        return response.data;
      } catch (error) {
        console.error('Profile update error:', error.response?.data);
        throw new Error(error.response?.data?.error || "Profile update failed");
      }
    },

    clearAuth() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
    }
  }
})