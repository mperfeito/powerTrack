<template>
  <aside class="sidebar">
    <div class="logo-container" @click="animateLogo">
      <i class="fas fa-bolt logo-icon"></i>
      <h4 class="logo-text">POWER TRACK</h4>
    </div>

    <nav class="nav-menu">
      <router-link 
        v-for="item in menuItems" 
        :key="item.path"
        :to="item.path"
        v-slot="{ isActive }"
        custom
      >
        <div 
          class="nav-item"
          :class="{ 'active': isActive }"
          @click="navigateTo(item.path)"
        >
          <i :class="item.icon"></i>
          <span class="item-label">{{ item.label }}</span>
          <div class="active-indicator"></div>
        </div>
      </router-link>
    </nav>

    <div class="logout-btn" @click="logout">
      <i class="fas fa-sign-out-alt"></i>
      <span>Logout</span>
    </div>
  </aside>
</template>

<script>
import { useAuthStore } from '@/stores/authStore';

export default {
  data() {
    return {
      menuItems: [
        { path: '/dashboard', icon: 'fas fa-tachometer-alt', label: 'Dashboard' },
        { path: '/houses', icon: 'fas fa-home', label: 'Houses' },
        { path: '/goals', icon: 'fas fa-bullseye', label: 'Goals' },
        { path: '/appliances', icon: 'fas fa-plug', label: 'Appliances' },
        { path: '/notifications', icon: 'fas fa-bell', label: 'Notifications' },
        { path: '/settings', icon: 'fas fa-cog', label: 'Settings' }
      ]
    }
  },
  methods: {
    animateLogo() {
      const logo = document.querySelector('.logo-icon')
      logo.classList.add('pulse')
      setTimeout(() => logo.classList.remove('pulse'), 500)
    },
    navigateTo(path) {
      this.$router.push(path)
    },
    async logout() {      
      try {
        const authStore = useAuthStore();    
        await authStore.clearAuth();  
        this.$router.push('/login'); 
        console.log('Logout successful');
      } catch (error) {
        console.error('Logout failed:', error);
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.sidebar {
  width: 250px;
  height: 100vh;
  background: linear-gradient(180deg, #dfb046 0%, #dbc189 100%);
  display: flex;
  flex-direction: column;
  padding: 2rem 1rem;
  box-shadow: 5px 0 15px rgba(0, 0, 0, 0.1);
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;
}

.logo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
  cursor: pointer;
  transition: transform 0.3s ease;
  padding: 1rem;
  border-radius: 8px;

  &:hover {
    transform: translateY(-3px);
    background: rgba(255, 255, 255, 0.1);
  }

  .logo-icon {
    font-size: 2.5rem;
    color: white;
    margin-bottom: 0.5rem;
    transition: all 0.3s ease;
  }

  .logo-text {
    color: white;
    font-weight: 700;
    font-size: 1.2rem;
    letter-spacing: 1px;
  }
}

  .nav-menu {
    flex: 1;
    overflow-y: auto;
    scrollbar-width: thin;
    margin-bottom: 1rem;

    &::-webkit-scrollbar {
      width: 4px;
    }
    &::-webkit-scrollbar-thumb {
      background: rgba(70, 112, 84, 0.5);
      border-radius: 2px;
    }}

.nav-item {
  display: flex;
  align-items: center;
  padding: 0.8rem 1.2rem;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  background: transparent;

  i {
    font-size: 1.1rem;
    width: 24px;
    margin-right: 12px;
    transition: transform 0.3s ease;
  color: rgba(255, 255, 255, 0.9);
  }

  .item-label {
    font-weight: 500;
    transition: all 0.3s ease;
  }

  .active-indicator {
    position: absolute;
    right: -10px;
    width: 3px;
    height: 0;
    background: #467054;
    border-radius: 3px 0 0 3px;
    transition: all 0.3s ease;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    
    i {
      transform: scale(1.1);
      color: white;
    }

    .item-label {
      letter-spacing: 0.5px;
    }

    .active-indicator {
      height: 60%;
    }
  }

  &.active {
    background: rgba(70, 112, 84, 0.3);
    
    i {
      color: white;
    }

    .active-indicator {
      height: 80%;
      right: 0;
      background: #467054;
    }

    &::after {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, rgba(70, 112, 84, 0.2) 0%, transparent 100%);
    }
  }
}

.logout-btn {
  display: flex;
  align-items: center;
  padding: 0.8rem 1.2rem;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  margin-top: auto;
  transition: all 0.3s ease;
  background: rgba(70, 112, 84, 0.2);

  i {
    margin-right: 12px;
    font-size: 1.1rem;
  }

  &:hover {
    background: rgba(70, 112, 84, 0.4);
    transform: translateX(5px);
  }
}


.pulse {
  animation: pulse 0.5s ease;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}
</style>