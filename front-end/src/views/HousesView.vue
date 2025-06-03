<template>
  <div class="d-flex">
    <Sidebar />
    
    <div class="houses-container flex-grow-1 p-5">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="text-dark fw-bold">
          <i class="fas fa-home me-2" style="color: #467054;"></i> My Houses
        </h2>
      </div>

      <div class="house-form settings-card p-4 mb-4">
  <h5 class="text-dark mb-3">
    <i class="fas" :class="isEditing ? 'fa-edit' : 'fa-plus-circle'" style="color: #467054;"></i>
    {{ isEditing ? 'Edit House' : 'Add New House' }}
  </h5>
  
  <div class="row g-3">
    <div class="col-md-3">
      <label class="form-label text-dark">Name</label>
      <input
        type="text"
        class="form-control settings-input"
        v-model="currentHouse.name"
        placeholder="e.g. Beach House"
        @keyup.enter="saveHouse"
      />
    </div>
    
    <div class="col-md-2">
      <label class="form-label text-dark">City</label>
      <input
        type="text"
        class="form-control settings-input"
        v-model="currentHouse.city"
        placeholder="e.g. Lisbon"
        @keyup.enter="saveHouse"
      />
    </div>
    
    <div class="col-md-3">
      <label class="form-label text-dark">Address</label>
      <input
        type="text"
        class="form-control settings-input"
        v-model="currentHouse.address"
        placeholder="e.g. 123 Ocean Drive"
        @keyup.enter="saveHouse"
      />
    </div>
    
    <div class="col-md-2">
      <label class="form-label text-dark">Postal Code</label>
      <input
        type="text"
        class="form-control settings-input"
        v-model="currentHouse.postalCode"
        placeholder="e.g. 1234-567"
        @keyup.enter="saveHouse"
      />
    </div>
    
    <div class="col-md-2 d-flex align-items-end gap-2">
      <button 
        class="btn btn-primary flex-grow-1"
        @click="saveHouse"
        :disabled="!currentHouse.name"
      >
        <i class="fas fa-save"></i>
        {{ isEditing ? 'Update' : 'Add' }}
      </button>
      <button 
        v-if="isEditing"
        class="btn btn-outline-secondary"
        @click="resetForm"
      >
        <i class="fas fa-times"></i>
      </button>
    </div>
  </div>
</div>

      <div class="house-list-horizontal">
        <div
          class="house-card-horizontal"
          v-for="house in houses"
          :key="house.id"
          :class="{ 'active-border': house.active }"
        >
          <div class="house-info">
            <div class="d-flex align-items-center gap-2 mb-2">
              <h5 class="text-dark m-0">{{ house.name }}</h5>
              <span v-if="house.active" class="active-badge">
                <i class="fas fa-check-circle me-1"></i> Active
              </span>
            </div>
            
            <div class="house-details">
              <div class="detail-item">
                <i class="fas fa-map-marker-alt me-2" style="color: #467054;"></i>
                <span>{{ house.address }}</span>
              </div>
              <div class="detail-item">
                <i class="fas fa-city me-2" style="color: #467054;"></i>
                <span>{{ house.city }}, {{ house.postalCode }}</span>
              </div>
            </div>
          </div>
          
          <div class="house-actions">
            <button
              class="btn btn-icon"
              @click="editHouse(house)"
              :disabled="house.active"
              title="Edit"
            >
              <i class="fas fa-edit"></i>
            </button>
            <button
              class="btn btn-icon"
              @click="setActiveHouse(house.id)"
              :class="{ 'btn-active': house.active }"
              :title="house.active ? 'Active' : 'Set as active'"
            >
              <i class="fas" :class="house.active ? 'fa-check-circle' : 'fa-power-off'"></i>
            </button>
            <button
              class="btn btn-icon btn-danger"
              @click="deleteHouse(house.id)"
              :disabled="house.active"
              title="Delete"
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
import Sidebar from "@/components/Sidebar.vue";
import { ref, computed } from "vue";
import { useHousesStore } from '@/stores/housesStore'; // ajusta o caminho conforme seu projeto

const housesStore = useHousesStore();

const isEditing = ref(false);
const currentHouse = ref({
  id: null,
  name: "",
  city: "",
  address: "",
  postalCode: "",
  active: false,
});

// Busca as casas e a casa ativa ao carregar o componente
housesStore.fetchHouses();
housesStore.fetchActiveHouse();

const houses = computed(() => {
  return housesStore.houses.map(house => ({
    id: house.id_house,
    name: house.name,
    city: house.city,
    address: house.address,
    postalCode: house.postal_code || house.postalCode,
    active: house.id_house === housesStore.activeHouseId,
  }));
});

const resetForm = () => {
  currentHouse.value = {
    id: null,
    name: "",
    city: "",
    address: "",
    postalCode: "",
    active: false,
  };
  isEditing.value = false;
};

const editHouse = (house) => {
  currentHouse.value = { ...house };
  isEditing.value = true;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const saveHouse = async () => {
  if (!currentHouse.value.name) return;

  try {
    if (isEditing.value) {
      await housesStore.updateHouse(currentHouse.value.id, {
        name: currentHouse.value.name,
        city: currentHouse.value.city,
        address: currentHouse.value.address,
        postal_code: currentHouse.value.postalCode,
      });
    } else {
      await housesStore.createHouse({
        name: currentHouse.value.name,
        city: currentHouse.value.city,
        address: currentHouse.value.address,
        postal_code: currentHouse.value.postalCode,
      });
    }
    await housesStore.fetchHouses();
    resetForm();
  } catch (error) {
    alert('Erro ao salvar casa: ' + error.message);
  }
};

const deleteHouse = async (id) => {
  const houseToDelete = houses.value.find(h => h.id === id);
  if (houseToDelete?.active) return alert('Não pode deletar a casa ativa.');

  if (confirm(`Tem certeza que deseja deletar ${houseToDelete.name}?`)) {
    try {
      await housesStore.deleteHouse(id);
      await housesStore.fetchHouses();
    } catch (error) {
      alert('Erro ao deletar casa: ' + error.message);
    }
  }
};

const setActiveHouse = async (id) => {
  try {
    await housesStore.setActiveHouse(id);
    await housesStore.fetchActiveHouse();
  } catch (error) {
    alert('Erro ao definir casa ativa: ' + error.message);
  }
};
</script>






<style scoped lang="scss">
.houses-container {
  background: white;
  min-height: 100vh;
  color: #212529;
  background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23467054' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E");
}

.house-form {
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border-radius: 1rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
}


.settings-input {
  background: white;
  border: 1px solid #dee2e6;
  &:focus {
    border-color: #467054;
    box-shadow: 0 0 0 0.25rem rgba(70, 112, 84, 0.25);
  }
}

.settings-card {
  border-radius: 1rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.house-list-horizontal {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.house-card-horizontal {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  
  &.active-border {
    border: 2px solid #467054;
    
    .btn-active {
      background: #467054;
      color: white;
    }
  }
}

.house-info {
  flex: 1;
  min-width: 0;
}

.house-details {
  margin-top: 0.5rem;
  color: #6c757d;
  font-size: 0.9rem;
  
  .detail-item {
    display: flex;
    align-items: center;
    margin-bottom: 0.25rem;
  }
}

.house-actions {
  display: flex;
  gap: 0.75rem;
  margin-left: 1.5rem;
}

.active-badge {
  padding: 0.35rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  background-color: #f0f7f2;
  color: #467054;
}

.btn-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f7f2;
  color: #467054;
  border: none;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: #e0efe6;
    transform: scale(1.1);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &.btn-danger {
    background: #fce8ea;
    color: #dc3545;
    
    &:hover:not(:disabled) {
      background: #f8d7da;
    }
  }
}

.btn-primary {
  background-color: #467054;
  border: none;
  color: white;
  &:hover:not(:disabled) {
    background-color: #3a5e47;
  }
  &:disabled {
    background-color: #a8c2b0;
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

@media (max-width: 992px) {
  .house-card-horizontal {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .house-actions {
    margin-left: 0;
    margin-top: 1rem;
    align-self: flex-end;
  }
}
</style>