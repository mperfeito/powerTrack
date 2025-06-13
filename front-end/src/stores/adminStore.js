// stores/adminStore.js
import { defineStore } from 'pinia'; 
import { ref } from 'vue';
import usersApi from '@/api/users';

export const useAdminStore = defineStore('admin', {
  state: () => ({
    users: [],
    loading: false,
    error: null,
    searchQuery: '',
    expandedUsers: [],
  }),

  getters: {
    filteredUsers: (state) => {
      if (!state.searchQuery) {
        return state.users;
      }
      
      const query = state.searchQuery.toLowerCase();
      return state.users.filter(user => 
        user.first_name.toLowerCase().includes(query) ||
        user.last_name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      );
    },
  },

  actions: {
    async fetchUsers() {
      this.loading = true;
      this.error = null;
      try {
        const response = await usersApi.getUsersAdmin();
        this.users = response.data;
      } catch (err) {
        this.error = err.response?.data?.error || 'Failed to fetch users';
        console.error('Error fetching users:', err);
      } finally {
        this.loading = false;
      }
    },

    toggleUserHouses(userId) {
      const index = this.expandedUsers.indexOf(userId);
      if (index > -1) {
        this.expandedUsers.splice(index, 1);
      } else {
        this.expandedUsers.push(userId);
      }
    },

    async deleteUser(userId) {
      try {
        await usersApi.deleteUser(userId);
        await this.fetchUsers(); 
      } catch (err) {
        this.error = err.response?.data?.error || 'Failed to delete user';
        console.error('Error deleting user:', err);
        throw err; 
      }
    },

    setSearchQuery(query) {
      this.searchQuery = query;
    },
  },
});