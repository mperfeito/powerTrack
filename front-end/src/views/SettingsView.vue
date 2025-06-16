<template>
  <div class="d-flex">
    <Sidebar />
    
    <div class="settings-container flex-grow-1 p-5">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="text-dark fw-bold">
          <i class="fas fa-cog me-2" style="color: #467054;"></i> Settings
        </h2>
      </div>

      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <div v-else class="settings-content">
        <div class="settings-card p-4 mb-4">
          <h5 class="text-dark mb-4">
            <i class="fas fa-user-circle me-2" style="color: #467054;"></i> Profile Information
          </h5>
          
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label text-dark">First Name</label>
              <input
                type="text"
                class="form-control settings-input"
                v-model="user.first_name"
                placeholder="John"
                required
              />
            </div>
            <div class="col-md-6">
              <label class="form-label text-dark">Last Name</label>
              <input
                type="text"
                class="form-control settings-input"
                v-model="user.last_name"
                placeholder="Doe"
                required
              />
            </div>
            <div class="col-md-6">
              <label class="form-label text-dark">Email</label>
              <input
                type="email"
                class="form-control settings-input"
                v-model="user.email"
                placeholder="john@example.com"
                disabled
              />
            </div>
            <div class="col-md-6">
              <label class="form-label text-dark">Phone Number</label>
              <input
                type="tel"
                class="form-control settings-input"
                v-model="user.phone_number"
                placeholder="123456789"
                pattern="[0-9]{9}"
                title="Please enter exactly 9 digits"
              />
            </div>
        
          </div>
          <br>
        <div class="settings-card p-4 mb-4">
          <h5 class="text-dark mb-4">
            <i class="fas fa-lock me-2" style="color: #467054;"></i> Security
          </h5>
          
          <div class="mb-3">
            <label class="form-label text-dark">Current Password</label>
            <input
              type="password"
              class="form-control settings-input"
              v-model="password.current"
              placeholder="Enter current password"
            />
          </div>
          
          <div class="mb-3">
            <label class="form-label text-dark">New Password</label>
            <input
              type="password"
              class="form-control settings-input"
              v-model="password.new"
              placeholder="Enter new password"
            />
          </div>
          
          <div class="mb-3">
            <label class="form-label text-dark">Confirm New Password</label>
            <input
              type="password"
              class="form-control settings-input"
              v-model="password.confirm"
              placeholder="Confirm new password"
            />
          </div>
        </div>

        <div class="d-flex justify-content-end mt-4">
          <button class="btn btn-outline-secondary me-2" @click="resetForm">
            Cancel
          </button>
          <button class="btn btn-primary" @click="saveSettings" :disabled="saving">
            <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
            {{ saving ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </div>
    </div>
  </div> 
</div>
</template>

<script setup>
import Sidebar from "../components/Sidebar.vue"; 
import { ref, onMounted } from "vue";
import { useAuthStore } from "../stores/authStore";

const authStore = useAuthStore();
const loading = ref(true);
const saving = ref(false);

const user = ref({
  first_name: "",
  last_name: "",
  email: "",
  phone_number: "",
  nif: ""
});

const password = ref({
  current: "",
  new: "",
  confirm: ""
});

// Fetch user data 
onMounted(async () => {
  try {
    if (!authStore.user) {
      await authStore.fetchUser();
    }
    
    user.value = { 
      first_name: authStore.user.first_name || "",
      last_name: authStore.user.last_name || "",
      email: authStore.user.email || "",
      phone_number: authStore.user.phone_number || "",
      nif: authStore.user.nif || ""
    };
    
    loading.value = false;
  } catch (error) {
    console.error("Error loading user data:", error);
  }
}); 

const saveSettings = async () => {
  saving.value = true;
  
  try {
    // Validate required fields
    if (!user.value.first_name || !user.value.last_name) {
      throw new Error("First name and last name are required");
    }

    // Validate phone number format
    if (user.value.phone_number && !/^\d{9}$/.test(user.value.phone_number)) {
      throw new Error("Phone number must be exactly 9 digits");
    }

    // Prepare payload with required fields only
    const payload = {
      first_name: user.value.first_name,
      last_name: user.value.last_name,
      phone_number: user.value.phone_number || null // Explicit null instead of undefined
    };

    await authStore.updateProfile(payload);

    // ... rest of the password update logic
  } catch (error) {
    alert(error.message);
  } finally {
    saving.value = false;
  }
};

const resetForm = () => {
  user.value = {
    first_name: authStore.user.first_name,
    last_name: authStore.user.last_name,
    email: authStore.user.email,
    phone_number: authStore.user.phone_number,
    nif: authStore.user.nif
  };
  password.value = { current: "", new: "", confirm: "" };
};
</script>

<style scoped lang="scss">
.settings-container {
  background: white;
  min-height: 100vh;
  color: #212529;
  margin-left: 250px;
  background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23467054' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E");

}

.settings-content {
  max-width: 800px;
  margin: 0 auto;
}

.settings-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  
 
}

.settings-input {
  background-color: white;
  border: 1px solid #ced4da;
  color: #212529;
  padding: 0.75rem;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
  
  &:focus {
    background-color: white;
    outline: none;
    box-shadow: 0 0 0 2px rgba(70, 112, 84, 0.25);
    border-color: #467054;
  }
  
  &::placeholder {
    color: #6c757d;
  }
}

.form-check-input {
  background-color: white;
  border: 1px solid #ced4da;
  width: 3em;
  height: 1.5em;
  
  &:checked {
    background-color: #467054;
    border-color: #467054;
  }
  
  &:focus {
    box-shadow: 0 0 0 0.25rem rgba(70, 112, 84, 0.25);
  }
}

.btn-primary {
  background-color: #467054;
  border: none;
  color: white;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #3a5e47;
    transform: translateY(-1px);
  }
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