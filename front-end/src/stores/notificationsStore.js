import { defineStore } from 'pinia';
import notificationsApi from '@/api/notifications';

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    notifications: [],
    isLoading: false,
    error: null,
    isDeleting: null,
    isSending: false
  }),

  actions: {
    async fetchNotifications() {
      try {
        this.isLoading = true;
        this.error = null;
        const response = await notificationsApi.getNotifications();
        this.notifications = response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch notifications';
        console.error('Error fetching notifications:', error);
      } finally {
        this.isLoading = false;
      }
    },

    async sendNotifications() {
      try {
        this.isSending = true;
        this.error = null;
        await notificationsApi.sendNotifications();
        await this.fetchNotifications(); 
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to send notifications';
        console.error('Error sending notifications:', error);
        throw error;
      } finally {
        this.isSending = false;
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
          notification => notification.id !== id
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