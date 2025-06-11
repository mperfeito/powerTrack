// src/stores/authStore.js
import { defineStore } from 'pinia'
import api from '../api/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.is_admin === 1 // Ensure this matches your API response
  },

  actions: {
    async login(credentials) {
      try {
        const response = await api.post('/login', credentials)
        this.token = response.data.token
        localStorage.setItem('token', this.token)
        await this.fetchUser() // Fetch user data immediately after login
        return true
      } catch (error) {
        this.clearAuth()
        throw error
      }
    },

    async register(userData) {
      try {
        const response = await api.post('/users', userData)
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
        this.user = response.data // Ensure this includes `is_admin: 1` for admins
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
        })
        return response.data
      } catch (error) {
        throw error
      }
    },

    clearAuth() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
    }
  }
})