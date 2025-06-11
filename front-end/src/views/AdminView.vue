<template>
  <div class="d-flex">
    <SidebarAdmin />
    
    <div class="admin-container flex-grow-1 p-5">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="text-dark fw-bold">
          <i class="fas fa-users-cog me-2" style="color: #467054;"></i> User Management
        </h2>
      </div>

      <div class="search-filter settings-card p-4 mb-4">
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label text-dark">Search Users</label>
            <input
              type="text"
              class="form-control settings-input"
              v-model="searchQuery"
              placeholder="Search by name or email..."
            />
          </div>
          <div class="col-md-3 d-flex align-items-end">
            <button class="btn btn-primary flex-grow-1" @click="fetchUsers">
              <i class="fas fa-filter me-1"></i> Apply Filters
            </button>
          </div>
        </div>
      </div>

      <div class="users-list">
        <div
          class="user-card"
          v-for="user in filteredUsers"
          :key="user.id"
        >
          <div class="user-header">
            <div class="user-avatar">
              <i class="fas fa-user-circle"></i>
            </div>
            <div class="user-info">
              <h5 class="text-dark m-0">{{ user.first_name }} {{ user.last_name }}</h5>
              <div class="user-meta">
                <span class="user-email">{{ user.email }}</span>
                <span class="user-role" :class="user.role">{{ user.role }}</span>
              </div>
            </div>
          </div>
          
          <div class="user-houses">
            <div class="houses-header">
              <h6 class="text-dark m-0">
                <i class="fas fa-home me-2" style="color: #467054;"></i>
                Houses ({{ user.houses.length }})
              </h6>
              <button
                class="btn btn-icon btn-sm"
                @click="toggleUserHouses(user.id)"
                :title="expandedUsers.includes(user.id) ? 'Collapse' : 'Expand'"
              >
                <i class="fas" :class="expandedUsers.includes(user.id) ? 'fa-chevron-up' : 'fa-chevron-down'"></i>
              </button>
            </div>
            
            <div class="houses-list" v-if="expandedUsers.includes(user.id)">
              <div
                class="house-item"
                v-for="house in user.houses"
                :key="house.id"
              >
                <div class="house-info">
                  <span class="house-name">{{ house.name }}</span>
                  <span class="house-address">{{ house.address }}</span>
                </div>
                <div class="house-actions">
                  <button
                    class="btn btn-icon btn-sm btn-danger"
                    @click="deleteHouse(house.id)"
                    title="Delete"
                  >
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div class="user-actions">
            <button
              class="btn btn-icon btn-danger"
              @click="confirmDeleteUser(user.id)"
              title="Delete User"
            >
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import SidebarAdmin from "@/components/SidebarAdmin.vue";
import { ref, computed, onMounted } from "vue";
import { Modal } from 'bootstrap';

// Mock data - replace with actual API calls
const users = ref([
  {
    id: 1,
    first_name: "Admin",
    last_name: "User",
    email: "admin@example.com",
    role: "admin",
    houses: [
      { id: 1, name: "Main Villa", address: "123 Admin St", square_meters: 200 },
      { id: 2, name: "Summer House", address: "456 Beach Rd", square_meters: 150 }
    ]
  },
  {
    id: 2,
    first_name: "John",
    last_name: "Doe",
    email: "john@example.com",
    role: "user",
    houses: [
      { id: 3, name: "Family Home", address: "789 Main St", square_meters: 180 }
    ]
  },
  {
    id: 3,
    first_name: "Jane",
    last_name: "Smith",
    email: "jane@example.com",
    role: "user",
    houses: []
  }
]);

const searchQuery = ref("");
const roleFilter = ref("all");
const expandedUsers = ref([]);
const isEditingUser = ref(false);
const isEditingHouse = ref(false);
const currentUser = ref(createEmptyUser());
const currentHouse = ref(createEmptyHouse());
const selectedUserId = ref(null);

function createEmptyUser() {
  return {
    first_name: "",
    last_name: "",
    email: "",
    role: "user",
    password: "",
    houses: []
  };
}

function createEmptyHouse() {
  return {
    name: "",
    address: "",
    square_meters: null
  };
}

function fetchUsers() {
  // In a real app, this would be an API call
  console.log("Fetching users with filters:", { search: searchQuery.value, role: roleFilter.value });
}

function toggleUserHouses(userId) {
  const index = expandedUsers.value.indexOf(userId);
  if (index > -1) {
    expandedUsers.value.splice(index, 1);
  } else {
    expandedUsers.value.push(userId);
  }
}

function editUser(user) {
  currentUser.value = { ...user };
  isEditingUser.value = true;
  const modal = new Modal(document.getElementById('userModal'));
  modal.show();
}

function openAddUserModal() {
  currentUser.value = createEmptyUser();
  isEditingUser.value = false;
  const modal = new Modal(document.getElementById('userModal'));
  modal.show();
}

function saveUser() {
  if (isEditingUser.value) {
    // Update existing user
    const index = users.value.findIndex(u => u.id === currentUser.value.id);
    if (index > -1) {
      users.value[index] = { ...currentUser.value };
    }
  } else {
    // Add new user
    const newUser = {
      ...currentUser.value,
      id: users.value.length + 1,
      houses: []
    };
    users.value.push(newUser);
  }
  
  const modal = Modal.getInstance(document.getElementById('userModal'));
  modal.hide();
}

function confirmDeleteUser(userId) {
  if (confirm("Are you sure you want to delete this user and all their houses?")) {
    deleteUser(userId);
  }
}

function deleteUser(userId) {
  users.value = users.value.filter(user => user.id !== userId);
}

function openAddHouseModal(userId) {
  selectedUserId.value = userId;
  currentHouse.value = createEmptyHouse();
  isEditingHouse.value = false;
  const modal = new Modal(document.getElementById('houseModal'));
  modal.show();
}

function editHouse(house) {
  currentHouse.value = { ...house };
  isEditingHouse.value = true;
  const modal = new Modal(document.getElementById('houseModal'));
  modal.show();
}

function saveHouse() {
  const user = users.value.find(u => u.id === selectedUserId.value);
  if (!user) return;

  if (isEditingHouse.value) {
    // Update existing house
    const index = user.houses.findIndex(h => h.id === currentHouse.value.id);
    if (index > -1) {
      user.houses[index] = { ...currentHouse.value };
    }
  } else {
    // Add new house
    const newHouse = {
      ...currentHouse.value,
      id: user.houses.length + 1
    };
    user.houses.push(newHouse);
  }
  
  const modal = Modal.getInstance(document.getElementById('houseModal'));
  modal.hide();
}

function deleteHouse(houseId) {
  if (confirm("Are you sure you want to delete this house?")) {
    users.value.forEach(user => {
      user.houses = user.houses.filter(house => house.id !== houseId);
    });
  }
}

const filteredUsers = computed(() => {
  let result = users.value;
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(user => 
      user.first_name.toLowerCase().includes(query) ||
      user.last_name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  }
  
  if (roleFilter.value !== "all") {
    result = result.filter(user => user.role === roleFilter.value);
  }
  
  return result;
});

onMounted(() => {
  // Initialize with all users expanded or fetch initial data
  // expandedUsers.value = users.value.map(user => user.id);
});
</script>

<style scoped lang="scss">
.admin-container {
  background: white;
  min-height: 100vh;
  color: #212529;
  background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23467054' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E");
}

.search-filter {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.users-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.user-card {
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    border-color: #dfb046;
  }
}

.user-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: rgba(70, 112, 84, 0.1);
  color: #467054;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-right: 1rem;
}

.user-info {
  flex: 1;
  
  h5 {
    font-size: 1.25rem;
  }
}

.user-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.9rem;
  color: #6c757d;
}

.user-role {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
  
  &.admin {
    background-color: rgba(220, 53, 69, 0.1);
    color: #dc3545;
  }
  
  &.user {
    background-color: rgba(70, 112, 84, 0.1);
    color: #467054;
  }
}

.user-houses {
  margin: 1rem 0;
}

.houses-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.houses-list {
  margin-top: 0.5rem;
}

.house-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px dashed rgba(0, 0, 0, 0.1);
  
  &:last-child {
    border-bottom: none;
  }
}

.house-info {
  display: flex;
  flex-direction: column;
  
  .house-name {
    font-weight: 500;
  }
  
  .house-address {
    font-size: 0.85rem;
    color: #6c757d;
  }
}

.house-actions {
  display: flex;
  gap: 0.5rem;
}

.user-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
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

.btn-primary {
  background-color: #467054;
  border: none;
  transition: all 0.3s ease;
  color: white;
  
  &:hover:not(:disabled) {
    background-color: #3a5e47;
    transform: translateY(-2px);
  }
  
  &:disabled {
    background-color: rgba(70, 112, 84, 0.5);
    cursor: not-allowed;
  }
}

.settings-input {
  background-color: white;
  border: 1px solid #ced4da;
  color: #212529;
  border-radius: 0.5rem;
  
  &:focus {
    background-color: white;
    outline: none;
    box-shadow: 0 0 0 2px rgba(70, 112, 84, 0.25);
    border-color: #467054;
  }
}

.settings-card {
  border-radius: 1rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background-color: white; 
}

@media (max-width: 768px) {
  .user-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .user-avatar {
    margin-right: 0;
    margin-bottom: 1rem;
  }
  
  .user-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>