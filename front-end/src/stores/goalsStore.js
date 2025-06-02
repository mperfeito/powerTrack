// src/stores/goalsStore.js
import { defineStore } from 'pinia'
import goalsApi from '@/api/goals'

//  format dates 
const formatDate = (dateString) => {
  if (!dateString) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return ''; 
  
  return date.toISOString().split('T')[0];
};

export const useGoalsStore = defineStore('goals', {
  state: () => ({
    goals: [],
    currentGoal: {
      id: null,
      targetValue: "",
      period: "monthly",
      startDate: "",
      endDate: ""
    },
    isEditing: false
  }),

  getters: {
    isGoalValid: (state) => {
      return state.currentGoal.targetValue > 0 && 
             state.currentGoal.startDate && 
             state.currentGoal.endDate;
    },
    
    activeGoals: (state) => {
      const today = formatDate(new Date());
      return state.goals.filter(goal => 
        goal.startDate <= today && goal.endDate >= today
      );
    }
  },

  actions: {
    async fetchGoals() {
      try {
        const response = await goalsApi.getGoals();
        this.goals = response.data.goals.map(goal => ({
          ...goal,
          id: goal.id_goal, 
          period: goal.period_type,
          targetValue: goal.target_value,
          startDate: formatDate(goal.start_date),
          endDate: formatDate(goal.end_date)
        }));
      } catch (error) {
        console.error('Failed to fetch goals:', error);
        throw error;
      }
    },

    async fetchGoalById(id) {
      try {
        const response = await goalsApi.getGoalById(id);
        const goal = response.data.goal;
        return {
          ...goal,
          id: goal.id_goal || goal.id, 
          start_date: formatDate(goal.start_date),
          end_date: formatDate(goal.end_date)
        };
      } catch (error) {
        console.error('Failed to fetch goal:', error);
        throw error;
      }
    },

    async createGoal(goalData) {
      try {
        const response = await goalsApi.createGoal({
          period_type: goalData.period,
          target_value: goalData.targetValue,
          start_date: formatDate(goalData.startDate),
          end_date: formatDate(goalData.endDate)
        });
        await this.fetchGoals();
        return response.data.goal;
      } catch (error) {
        console.error('Failed to create goal:', error);
        throw error;
      }
    },

    async updateGoal() {
      if (!this.currentGoal.id) {
        console.error('Cannot update goal: ID is missing');
        return;
      }
      
      try {
        const response = await goalsApi.updateGoal(this.currentGoal.id, {
          period_type: this.currentGoal.period,
          target_value: this.currentGoal.targetValue,
          start_date: formatDate(this.currentGoal.startDate),
          end_date: formatDate(this.currentGoal.endDate)
        });
        await this.fetchGoals();
        this.resetCurrentGoal();
        return response.data.goal;
      } catch (error) {
        console.error('Failed to update goal:', error);
        throw error;
      }
    },  

    async deleteGoal(id) {
      if (!id) {
        console.error('Cannot delete goal: ID is missing');
        return;
      }
      
      try {
        console.log('Deleting goal with ID:', id); // Debug log
        await goalsApi.deleteGoal(id);
        await this.fetchGoals(); // Refresh the goals list after deletion
      } catch (error) {
        console.error('Failed to delete goal:', error);
        throw error;
      }
    },

    setCurrentGoal(goal) {
      this.currentGoal = { 
        id: goal.id_goal || goal.id, // Handle both backend and frontend ID names
        targetValue: goal.target_value || goal.targetValue,
        period: goal.period_type || goal.period,
        startDate: formatDate(goal.start_date || goal.startDate),
        endDate: formatDate(goal.end_date || goal.endDate)
      };
      this.isEditing = true;
    },

    resetCurrentGoal() {
      this.currentGoal = {
        id: null,
        targetValue: "",
        period: "monthly",
        startDate: "",
        endDate: ""
      };
      this.isEditing = false;
    }
  }
});