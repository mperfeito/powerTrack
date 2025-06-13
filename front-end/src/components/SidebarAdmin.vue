<template>
  <aside class="sidebar">
    <div class="logo-container" @click="animateLogo">
      <i class="fas fa-bolt logo-icon"></i>
      <h4 class="logo-text">ADMIN PANEL</h4>
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
      if (!confirm('Are you sure you want to log out?')) {
        return;
      }
      
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
  overflow-y: auto;
  background: linear-gradient(180deg, #355943 0%, #467054 100%);
  display: flex;
  flex-direction: column;
  padding: 2rem 1rem;
  box-shadow: 5px 0 15px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
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
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex-grow: 1;
}

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
    background: #3498db;
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
    background: rgba(52, 152, 219, 0.3);
    
    i {
      color: white;
    }

    .active-indicator {
      height: 80%;
      right: 0;
      background: #3498db;
    }

    &::after {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, rgba(52, 152, 219, 0.2) 0%, transparent 100%);
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
  background: rgba(231, 76, 60, 0.2);

  i {
    margin-right: 12px;
    font-size: 1.1rem;
  }

  &:hover {
    background: rgba(231, 76, 60, 0.4);
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