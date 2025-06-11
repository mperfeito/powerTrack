import { defineStore } from 'pinia';
import { ref } from 'vue';
import notificationsApi from '@/api/notifications'; 

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref([]);
  const isLoading = ref(false);
  const error = ref(null);

  const fetchNotifications = async () => {
    try {
      isLoading.value = true;
      error.value = null;
      const response = await notificationsApi.getNotifications(); 
      notifications.value = response.data;
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch notifications';
      console.error('Error fetching notifications:', err);
    } finally {
      isLoading.value = false;
    }
  };

  const deleteNotification = async (id) => {
    try {
      await notificationsApi.deleteNotification(id); 
      notifications.value = notifications.value.filter(
        notification => notification.id_notification !== id
      );
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to delete notification';
      console.error('Error deleting notification:', err);
      throw err;
    }
  };

  return {
    notifications,
    isLoading,
    error,
    fetchNotifications,
    deleteNotification,
  };
});