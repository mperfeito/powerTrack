<template>
  <div class="d-flex">
    <Sidebar />
    
    <div class="goals-container flex-grow-1 p-5">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="text-dark fw-bold">
          <i class="fas fa-bullseye me-2" style="color: #467054;"></i> Energy Goals
        </h2>
      </div>

      <div class="goal-form settings-card p-4 mb-4">
        <h5 class="text-dark mb-3">
          <i class="fas" :class="isEditing ? 'fa-edit' : 'fa-plus-circle'" style="color: #467054;"></i>
          {{ isEditing ? 'Edit Goal' : 'Add New Goal' }}
        </h5>
        
        <div class="row g-3">
          <div class="col-md-3">
            <label class="form-label text-dark">Target Value (kWh)</label>
            <input
              type="number"
              class="form-control settings-input"
              v-model="currentGoal.targetValue"
              placeholder="e.g. 500"
              min="1"
              @keyup.enter="saveGoal"
            />
          </div>
          
          <div class="col-md-3">
            <label class="form-label text-dark">Period</label>
            <select class="form-select settings-input" v-model="currentGoal.period">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          
          <div class="col-md-2">
            <label class="form-label text-dark">Start Date</label>
            <input
              type="date"
              class="form-control settings-input"
              v-model="currentGoal.startDate"
            />
          </div>
          
          <div class="col-md-2">
            <label class="form-label text-dark">End Date</label>
            <input
              type="date"
              class="form-control settings-input"
              v-model="currentGoal.endDate"
            />
          </div>
          
          <div class="col-md-2 d-flex align-items-end gap-2">
            <button 
              class="btn btn-primary flex-grow-1"
              @click="saveGoal"
              :disabled="!isGoalValid"
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

      <div class="horizontal-goals-list">
        <div
          class="goal-card-horizontal"
          v-for="goal in goals"
          :key="goal.id"
        >
          <div class="goal-content">
            <div class="goal-header">
              <h5 class="text-dark m-0">{{ goal.targetValue }} kWh</h5>
              <span class="period-badge">
                {{ formatPeriod(goal.period) }}
              </span>
            </div>
            
            <div class="goal-dates">
              <div class="date-item">
                <i class="fas fa-calendar-day me-2" style="color: #467054;"></i>
                <span>{{ formatDate(goal.startDate) }}</span>
              </div>
              <div class="date-item">
                <i class="fas fa-calendar-day me-2" style="color: #467054;"></i>
                <span>{{ formatDate(goal.endDate) }}</span>
              </div>
            </div>
          </div>
          
          <div class="goal-actions">
            <button
              class="btn btn-icon"
              @click="editGoal(goal)"
              title="Edit"
            >
              <i class="fas fa-edit"></i>
            </button>
            <button
              class="btn btn-icon btn-danger"
              @click="deleteGoal(goal.id)"
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
import { computed, onMounted } from "vue";
import { useGoalsStore } from "@/stores/goalsStore";

const store = useGoalsStore();

onMounted(async () => {
  await store.fetchGoals();
});

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', { 
    month: 'short', day: 'numeric' 
  });
};

const formatPeriod = (period) => {
  return period.charAt(0).toUpperCase() + period.slice(1);
};

const editGoal = (goal) => {
  store.setCurrentGoal(goal);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const saveGoal = async () => {
  if (store.isEditing) {
    await store.updateGoal();
  } else {
    await store.createGoal(store.currentGoal);
  }
};

const deleteGoal = (id) => { 
    store.deleteGoal(id);
};

const resetForm = () => {
  store.resetCurrentGoal();
};

const goals = computed(() => store.goals);
const currentGoal = computed(() => store.currentGoal);
const isEditing = computed(() => store.isEditing);
const isGoalValid = computed(() => store.isGoalValid);
</script>

<style scoped lang="scss">
.goals-container {
  background: white;
  min-height: 100vh;
  color: #212529;
  margin-left: 250px;
  background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23467054' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E");
}

.goal-form {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.horizontal-goals-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.goal-card-horizontal {
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

.goal-content {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  align-items: center;
}

.goal-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  
  h5 {
    font-size: 1.25rem;
  }
}

.goal-dates {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  
  .date-item {
    display: flex;
    align-items: center;
    color: #6c757d;
    font-size: 0.9rem;
  }
}

.goal-actions {
  display: flex;
  gap: 0.75rem;
}

.period-badge {
  padding: 0.35rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
  background-color: rgba(70, 112, 84, 0.1);
  color: #467054;
  width: fit-content;
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

.btn-outline-secondary {
  border-color: #467054;
  color: #467054;
  
  &:hover {
    background-color: #467054;
    color: white;
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
  .goal-content {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .goal-card-horizontal {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .goal-actions {
    align-self: flex-end;
    margin-top: 1rem;
  }
}

@media (max-width: 768px) {
  .goal-form .row > div {
    margin-bottom: 1rem;
  }
  
  .goal-form .col-md-2,
  .goal-form .col-md-3 {
    width: 100%;
  }
}

.settings-card {
  border-radius: 1rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background-color: white; 
}

.goal-form {
  background-color: white; 
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}
</style>