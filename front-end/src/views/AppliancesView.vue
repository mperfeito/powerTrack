<template>
  <div class="d-flex">
    <Sidebar />

    <div class="appliances-container flex-grow-1 p-5">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="text-dark fw-bold">
          <i class="fas fa-plug me-2" style="color: #467054"></i> My Appliances
        </h2>
      </div>

   
      <div class="appliance-form settings-card p-4 mb-4">
        <h5 class="text-dark mb-3">
          <i
            class="fas"
            :class="isEditing ? 'fa-edit' : 'fa-plus-circle'"
            style="color: #467054"
          ></i>
          {{ isEditing ? "Edit Appliance" : "Add New Appliance" }}
        </h5>

        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label text-dark">Name</label>
            <input
              type="text"
              class="form-control settings-input"
              v-model="currentAppliance.name"
              placeholder="e.g. Air Conditioner"
              @keyup.enter="saveAppliance"
            />
          </div>

          <div class="col-md-2">
            <label class="form-label text-dark">Power (W)</label>
            <input
              type="number"
              class="form-control settings-input"
              v-model="currentAppliance.nominal_power_watts"
              placeholder="1500"
            />
          </div>

          <div class="col-md-2">
            <label class="form-label text-dark">State</label>
            <select
              class="form-select settings-input"
              v-model="currentAppliance.state"
            >
              <option value="on">On</option>
              <option value="off">Off</option>
              <option value="standby">Standby</option>
            </select>
          </div>

          <div class="col-md-2">
            <label class="form-label text-dark">Hours/Day</label>
            <input
              type="number"
              class="form-control settings-input"
              v-model="currentAppliance.operating_hours"
              placeholder="5"
              min="0"
              max="24"
            />
          </div>

          <div class="col-md-2 d-flex align-items-end">
            <button
              class="btn btn-primary w-100"
              @click="saveAppliance"
              :disabled="!currentAppliance.name"
            >
              <i class="fas fa-save me-1"></i>
              {{ isEditing ? "Update" : "Add" }}
            </button>
          </div>
        </div>
      </div>

    
      <div class="appliance-list-horizontal">
        <div
          class="appliance-card-horizontal"
          v-for="appliance in appliancesStore.appliances"
          :key="appliance.id"
        >
          <div class="appliance-info">
            <div class="appliance-header">
              <h5 class="text-dark m-0">{{ appliance.name }}</h5>
              <span class="status-badge" :class="appliance.state">
                <i class="fas" :class="stateIcon(appliance.state)"></i>
                {{ appliance.state }}
              </span>
            </div>

            <div class="appliance-specs">
              <div class="spec-item">
                <i class="fas fa-bolt me-2" style="color: #467054"></i>
                <span>{{ appliance.nominal_power_watts }}W</span>
              </div>
              <div class="spec-item">
                <i class="fas fa-clock me-2" style="color: #467054"></i>
                <span>{{ appliance.operating_hours }}h/day</span>
              </div>
            </div>
          </div>

          <div class="appliance-consumption">
            <div class="consumption-value">
              {{ calculateDailyConsumption(appliance) }} Wh
            </div>
            <div class="consumption-label">Daily Consumption</div>
          </div>

          <div class="appliance-actions">
            <button
              class="btn btn-icon"
              @click="editAppliance(appliance)"
              title="Edit"
            >
              <i class="fas fa-edit"></i>
            </button>
            <button
              class="btn btn-icon btn-danger"
              @click="deleteAppliance(appliance.id)"
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

<!-- <script setup>
import Sidebar from "@/components/Sidebar.vue";
import { ref } from "vue";

const appliances = ref([
  {
    id: 1,
    name: "Smart TV",
    nominal_power_watts: 120,
    state: "standby",
    operating_hours: 5,
  },
  {
    id: 2,
    name: "Refrigerator",
    nominal_power_watts: 200,
    state: "on",
    operating_hours: 24,
  },
  {
    id: 3,
    name: "Washing Machine",
    nominal_power_watts: 800,
    state: "off",
    operating_hours: 1,
  },
]);

const isEditing = ref(false);
const currentAppliance = ref({
  id: null,
  name: "",
  nominal_power_watts: "",
  state: "on",
  operating_hours: "",
});

const stateIcon = (state) => {
  return {
    on: "fa-power-off text-success", 
    off: "fa-toggle-off text-danger", 
    standby: "fa-pause-circle text-warning", 
  }[state];
};

const calculateDailyConsumption = (appliance) => {
  return appliance.nominal_power_watts * appliance.operating_hours;
};

const editAppliance = (appliance) => {
  currentAppliance.value = { ...appliance };
  isEditing.value = true;
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const saveAppliance = () => {
  if (isEditing.value) {
    const index = appliances.value.findIndex(
      (a) => a.id === currentAppliance.value.id
    );
    if (index !== -1) {
      appliances.value[index] = { ...currentAppliance.value };
    }
  } else {
    const newId = Math.max(...appliances.value.map((a) => a.id), 0) + 1;
    appliances.value.push({
      ...currentAppliance.value,
      id: newId,
    });
  }
  resetForm();
};

const deleteAppliance = (id) => {
  if (confirm("Are you sure you want to delete this appliance?")) {
    appliances.value = appliances.value.filter((a) => a.id !== id);
  }
};

const resetForm = () => {
  currentAppliance.value = {
    id: null,
    name: "",
    nominal_power_watts: "",
    state: "on",
    operating_hours: "",
  };
  isEditing.value = false;
};
</script> -->

<script setup>
import Sidebar from "@/components/Sidebar.vue";
import { ref, onMounted } from "vue";
import { useAppliancesStore } from "@/stores/appliancesStore";

const appliancesStore = useAppliancesStore();

const isEditing = ref(false);
const currentAppliance = ref({
  id: null,
  name: "",
  nominal_power_watts: "",
  state: "on",
  operating_hours: "",
});

const stateIcon = (state) => {
  return {
    on: "fa-power-off text-success",
    off: "fa-toggle-off text-danger",
    standby: "fa-pause-circle text-warning",
  }[state];
};

const calculateDailyConsumption = (appliance) => {
  return appliance.nominal_power_watts * appliance.operating_hours;
};

const editAppliance = (appliance) => {
  currentAppliance.value = { ...appliance };
  isEditing.value = true;
  window.scrollTo({ top: 0, behavior: "smooth" });
};

const saveAppliance = async () => {
  try {
    if (isEditing.value) {
      await appliancesStore.updateAppliance(currentAppliance.value);
    } else {
      await appliancesStore.createAppliance(currentAppliance.value);
    }
    resetForm();
  } catch (error) {
    console.error("Erro ao salvar aparelho:", error);
    alert("Não foi possível salvar o aparelho.");
  }
};

const deleteAppliance = async (id) => {
  if (confirm("Are you sure you want to delete this appliance?")) {
    try {
      await appliancesStore.deleteAppliance(id);
    } catch (error) {
      console.error("Failed to delete appliance", error);
    }
  }
};

const resetForm = () => {
  currentAppliance.value = {
    id: null,
    name: "",
    nominal_power_watts: "",
    state: "on",
    operating_hours: "",
  };
  isEditing.value = false;
};

onMounted(() => {
  appliancesStore.fetchAppliances();
});
</script>



<style scoped lang="scss">
.appliances-container {
  background: white;
  min-height: 100vh;
  color: #212529;
  background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23467054' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E");
  
}

.appliance-form {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}


.appliance-list-horizontal {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.appliance-card-horizontal {
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
}

.appliance-info {
  flex: 1;
  min-width: 0;
}

.appliance-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.appliance-specs {
  display: flex;
  gap: 1.5rem;

  .spec-item {
    display: flex;
    align-items: center;
    color: #6c757d;
    font-size: 0.9rem;
  }
}

.appliance-consumption {
  text-align: center;
  min-width: 120px;
  margin: 0 1.5rem;

  .consumption-value {
    font-size: 1.25rem;
    font-weight: 600;
    color: #467054;
  }

  .consumption-label {
    font-size: 0.8rem;
    color: #6c757d;
  }
}

.appliance-actions {
  display: flex;
  gap: 0.75rem;
}

.status-badge {
  padding: 0.35rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;

  &.on {
    background-color: rgba(70, 112, 84, 0.1);
    color: #467054;
  }

  &.off {
    background-color: rgba(220, 53, 69, 0.1); 
    color: #dc3545; 
  }

  &.standby {
    background-color: rgba(223, 176, 70, 0.1);
    color: #dfb046;
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

@media (max-width: 992px) {
  .appliance-card-horizontal {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .appliance-consumption {
    margin: 0;
    align-self: flex-start;
    text-align: left;
  }

  .appliance-actions {
    align-self: flex-end;
    margin-top: 1rem;
  }
}

@media (max-width: 768px) {
  .appliance-form .row > div {
    margin-bottom: 1rem;
  }

  .appliance-form .col-md-2,
  .appliance-form .col-md-4 {
    width: 100%;
  }

  .appliance-specs {
    flex-direction: column;
    gap: 0.5rem;
  }
}

.settings-card {
  border-radius: 1rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background-color: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.appliance-form {
  background-color: white; 
}
</style>
