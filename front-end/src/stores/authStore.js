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
        const response = await api.post('/users/login', credentials)
        this.token = response.data.token
        localStorage.setItem('token', this.token)
        await this.fetchUser()
        return true
      } catch (error) {
        this.clearAuth()
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