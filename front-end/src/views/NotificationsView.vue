<template>
  <div class="d-flex">
    <Sidebar />
    
    <div class="notifications-container flex-grow-1 p-5">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="text-dark fw-bold">
          <i class="fas fa-bell me-2" style="color: #467054;"></i> Notifications
        </h2>
        <div class="d-flex align-items-center gap-3">
          <div class="dropdown">
            <button 
              class="btn btn-outline-secondary dropdown-toggle"
              type="button"
              id="filterDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i class="fas fa-filter me-1"></i> 
              {{ activeFilter === 'all' ? 'All' : filterOptions[activeFilter]?.label || 'Filter' }}
            </button>
            <ul class="dropdown-menu" aria-labelledby="filterDropdown">
              <li>
                <button 
                  class="dropdown-item d-flex align-items-center" 
                  @click="setFilter('all')"
                  :class="{ active: activeFilter === 'all' }"
                >
                  <i class="fas fa-list me-2"></i> All Notifications
                </button>
              </li>
              <li><hr class="dropdown-divider"></li>
              <li v-for="(option, key) in filterOptions" :key="key">
                <button 
                  class="dropdown-item d-flex align-items-center" 
                  @click="setFilter(key)"
                  :class="{ active: activeFilter === key }"
                >
                  <i :class="`${option.icon} me-2`" :style="`color: ${option.color}`"></i>
                  {{ option.label }}
                </button>
              </li>
            </ul>
          </div>
          <button 
            @click="fetchNotifications" 
            class="btn btn-outline-secondary"
            :disabled="isLoading"
          >
            <i class="fas fa-sync" :class="{ 'fa-spin': isLoading }"></i> Refresh
          </button>
        </div>
      </div>

      <div v-if="error" class="alert alert-danger mb-4">
        {{ error }}
      </div>

      <div v-if="isLoading && notifications.length === 0" class="text-center py-5">
        <div class="spinner-border text-success" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <div v-else-if="notifications.length === 0" class="text-center py-5">
        <i class="fas fa-bell-slash fa-3x mb-3" style="color: #467054; opacity: 0.5;"></i>
        <h5>No notifications</h5>
        <p class="text-muted">You're all caught up!</p>
      </div>

      <div v-else class="notification-list">
        <div 
          v-for="notification in filteredNotifications" 
          :key="notification.id_notification" 
          class="notification-card p-4 mb-3"
        >
          <div class="d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-start gap-3 flex-grow-1">
              <div class="notification-icon" :class="getNotificationType(notification.type)">
                <i :class="getNotificationIcon(notification.type)"></i>
              </div>
              <div class="flex-grow-1">
                <div class="d-flex justify-content-between align-items-start"> 
                  <h5 class="text-dark mb-1">{{ getNotificationTitle(notification.type) }}</h5> 
                  <div>  
                    <i class="fas fa-calendar-day me-2" style="color: #467054;"></i>
                    <small class="text-secondary">{{ formatTime(notification.created_at) }}</small>
                  </div>
                </div>
                <p class="text-secondary mb-0">{{ notification.message }}</p>
              </div>
            </div>
            <div class="ms-3">
              <button
                class="btn btn-icon btn-danger"
                @click="deleteNotification(notification.id_notification)"
                title="Delete"
                :disabled="isLoading"
              >
              <i v-if="isDeleting !== notification.id_notification" class="fas fa-trash-alt"></i>
              <span v-else class="spinner-border spinner-border-sm" role="status"></span>
              </button>
            </div>
          </div>
        
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import Sidebar from "@/components/Sidebar.vue";
import { useNotificationsStore } from '@/stores/notificationsStore';


const isDeleting = ref(null);
const activeFilter = ref('all');
const notificationsStore = useNotificationsStore();
const { notifications, isLoading, error } = storeToRefs(notificationsStore);

// Filter configuration - now a reactive constant
const filterOptions = {
  high_consumption: {
    label: 'High Consumption',
    icon: 'fas fa-exclamation',
    color: '#dc3545'
  },
  low_consumption: {
    label: 'Low Consumption',
    icon: 'fas fa-leaf',
    color: '#dfb046'
  },
  peak_consumption: {
    label: 'Energy Peak',
    icon: 'fas fa-bolt',
    color: '#0d6efd'
  },
  goal_completed: {
    label: 'Goal Completed',
    icon: 'fas fa-trophy',
    color: '#467054'
  }
};

// Computed properties
const filteredNotifications = computed(() => {
  if (activeFilter.value === 'all') {
    return notifications.value;
  }
  return notifications.value.filter(
    notification => notification.type === activeFilter.value
  );
});

// Methods
const setFilter = (filterType) => {
  activeFilter.value = filterType;
};

const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleDateString();
};

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getNotificationType = (type) => {
  const typeMap = {
    high_consumption: 'high-consumption',
    low_consumption: 'low-consumption',
    peak_consumption: 'energy-peak',
    goal_completed: 'goal-achieved',
  };
  return typeMap[type] || 'new-feature';
};

const getNotificationIcon = (type) => {
  const iconMap = {
    high_consumption: 'fas fa-exclamation',
    low_consumption: 'fas fa-leaf',
    peak_consumption: 'fas fa-bolt',
    goal_completed: 'fas fa-trophy',
  };
  return iconMap[type] || 'fas fa-star';
};

const getNotificationTitle = (type) => {
  const titleMap = {
    high_consumption: 'High Consumption',
    low_consumption: 'Low Consumption',
    peak_consumption: 'Energy Peak',
    goal_completed: 'Goal Achieved!',
  };
  return titleMap[type] || 'Notification';
};

onMounted(() => {
  notificationsStore.fetchNotifications();
  
});


const deleteNotification = async (id) => {
  if (!id) {
    error.value = 'Invalid notification ID';
    console.error('Attempted to delete notification with undefined ID');
    return;
  }

  if (confirm('Are you sure you want to delete this Notification?')) {
    isDeleting.value = id;
    try {
      console.log('Deleting notification with ID:', id);
      await notificationsStore.deleteNotification(id);
    } catch (e) {
      error.value = e.response?.data?.message || 
                  'Failed to delete notification. Please try again.';
      console.error('Delete error:', e);
    } finally {
      isDeleting.value = null;
    }
  }
};

const fetchNotifications = () => {
  notificationsStore.fetchNotifications();
};

onMounted(() => {
  notificationsStore.fetchNotifications();
});

defineExpose({
  filterOptions
});
</script>

<style scoped lang="scss">
.notifications-container {
  background: white;
  min-height: 100vh;
  color: #212529;
  margin-left: 250px;
  background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23467054' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E");
}

.notification-list {
  max-height: calc(100vh - 120px);
  overflow-y: auto;
  padding-right: 10px;
  padding-top: 2%;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(70, 112, 84, 0.2);
    border-radius: 3px;
  }
}

.notification-card {
  background-color: white;
  border-radius: 1rem;
  padding: 1.5rem;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    border-color: #dfb046;
  }
}

.notification-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  flex-shrink: 0;
  
  &.goal-achieved {
    background-color: rgba(70, 112, 84, 0.2);
    color: #467054;
  }
  
  &.low-consumption {
    background-color: rgba(223, 176, 70, 0.2);
    color: #dfb046;
  }
  
  &.high-consumption {
    background-color: rgba(220, 53, 69, 0.2);
    color: #dc3545;
  }
  
  &.energy-peak {
    background-color: rgba(13, 110, 253, 0.2);
    color: #0d6efd;
  }
  
  &.device-offline {
    background-color: rgba(108, 117, 125, 0.2);
    color: #6c757d;
  }
  
  &.new-feature {
    background-color: rgba(111, 66, 193, 0.2);
    color: #6f42c1;
  }
}

.btn-action {
  background-color: rgba(70, 112, 84, 0.1);
  color: #467054;
  border: none;
  padding: 0.25rem 0.75rem;
  font-weight: 500;
  
  &:hover {
    background-color: rgba(70, 112, 84, 0.2);
  }
} 

.btn-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex; 
  align-items: center;
  justify-content: center;
  background: rgba(70, 112, 84, 0.1);
  color: #467054;
  border: none;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(70, 112, 84, 0.2);
    transform: scale(1.1);
  }
  
  &.btn-danger {
    background: rgba(220, 53, 69, 0.1);
    color: #dc3545;
    
    &:hover {
      background: rgba(220, 53, 69, 0.2);
    }
  }
}

.text-secondary {
  color: #6c757d !important;
}

.btn-outline-secondary {
  border-color: #467054;
  color: #467054;
  
  &:hover {
    background-color: #467054;
    color: white;
  }
}
</style>