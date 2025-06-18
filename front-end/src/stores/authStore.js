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

    async updateUser(data) {
      try {
        const payload = {
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone_number: data.phone_number,
          nif: data.nif
        };
        if (data.password) {
          payload.password = data.password;
        }
    
        const response = await api.patch('/users/me', payload);
    
        this.user = {
          ...this.user,
          ...response.data
        };
    
        return response.data;
      } catch (error) {
        console.error('User update error:', error);
        throw new Error(error.response?.data?.error || "Update failed");
      }
    },
    

    clearAuth() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
    }
  }
})