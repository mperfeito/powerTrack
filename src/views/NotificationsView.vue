<template>
  <div class="d-flex">
    <Sidebar />
    
    <div class="notifications-container flex-grow-1 p-5">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="text-dark fw-bold">
          <i class="fas fa-bell me-2" style="color: #467054;"></i> Notifications
        </h2>
      </div>

      <div class="notification-list">
        <div v-for="(notification, index) in notifications" :key="index" class="notification-card p-4 mb-3">
          <div class="d-flex align-items-start gap-3">
            <div class="notification-icon" :class="notification.type">
              <i :class="notification.icon"></i>
            </div>
            <div class="flex-grow-1">
              <div class="d-flex justify-content-between align-items-start">
                <h5 class="text-dark mb-1">{{ notification.title }}</h5>
                <small class="text-secondary">{{ notification.time }}</small>
              </div>
              <p class="text-secondary mb-2">{{ notification.message }}</p>
              <div class="d-flex gap-2">
                <button @click="markAsRead(index)" class="btn btn-sm btn-action">
                  Mark as read
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Sidebar from "@/components/Sidebar.vue";

const notifications = ref([
  {
    type: 'goal-achieved',
    icon: 'fas fa-trophy',
    title: 'Goal Achieved!',
    time: '10 min ago',
    message: 'Your Main House achieved 100% of energy saving target this week'
  },
  {
    type: 'low-consumption',
    icon: 'fas fa-leaf',
    title: 'Low Consumption',
    time: '1 hour ago',
    message: 'Beach House shows 30% lower than average consumption'
  },
  {
    type: 'high-consumption',
    icon: 'fas fa-exclamation',
    title: 'High Consumption',
    time: '3 hours ago',
    message: 'Main House detected 45% higher energy usage than usual'
  },
  {
    type: 'energy-peak',
    icon: 'fas fa-bolt',
    title: 'Energy Peak',
    time: 'Yesterday, 6:45 PM',
    message: 'Peak consumption detected between 6:30-7:00 PM (3.5 kW)'
  },
  {
    type: 'device-offline',
    icon: 'fas fa-plug',
    title: 'Device Offline',
    time: 'Yesterday, 4:20 PM',
    message: 'Smart plug in Living Room has been offline for 2 hours'
  },
  {
    type: 'new-feature',
    icon: 'fas fa-star',
    title: 'New Feature Available',
    time: '2 days ago',
    message: 'Check out our new energy consumption comparison tool'
  }
]);

const markAsRead = (index) => {
  notifications.value.splice(index, 1);
};
</script>

<style scoped lang="scss">
.notifications-container {
  background: white;
  min-height: 100vh;
  color: #212529;
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