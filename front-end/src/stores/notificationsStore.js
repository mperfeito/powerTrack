import { defineStore } from 'pinia';
import notificationsApi from '@/api/notifications';

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    notifications: [],
    isLoading: false,
    error: null,
    isDeleting: null
  }),

  actions: {
    async fetchNotifications() {
      try {
        this.isLoading = true;
        this.error = null;
        const response = await notificationsApi.getNotifications();
        this.notifications = response.data; // No ID mapping needed now
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch notifications';
        console.error('Error fetching notifications:', error);
      } finally {
        this.isLoading = false;
      }
    },

    async deleteNotification(id) {
      if (!id) {
        this.error = 'Invalid notification ID';
        console.error('Delete attempt with invalid ID:', id);
        return false;
      }

      try {
        this.isDeleting = id;
        await notificationsApi.deleteNotification(id);
        this.notifications = this.notifications.filter(
          notification => notification.id !== id // Changed from id_notification to id
        );
        return true;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to delete notification';
        console.error('Error deleting notification:', error);
        throw error;
      } finally {
        this.isDeleting = null;
      }
    }
  }
});