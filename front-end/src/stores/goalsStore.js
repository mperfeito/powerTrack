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
    goalProgress:{}, 
    isLodding: false, 
    error:null,
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
      activeGoal: (state) => {
      if (state.goals.length === 0) return null;
      
      const now = new Date();
      const currentDate = now.toISOString().split('T')[0];
      
      const sortedGoals = [...state.goals].sort((a, b) => {
        const dateA = new Date(a.endDate);
        const dateB = new Date(b.endDate);
        return dateA - dateB; 
      });
      
      const upcomingGoal = sortedGoals.find(goal => goal.endDate >= currentDate);
      return upcomingGoal || sortedGoals[sortedGoals.length - 1];
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

    async calculateGoalProgress(id) {  
      if (!id) {
        console.error('Cannot calculate progress: ID is missing');
        return;
      }
      
      this.isLoading = true;
      this.error = null;
      try {
        const response = await goalsApi.calculateGoalProgress(id);
        
        this.goalProgress[id] = {
          percentage: response.data.progress_percentage,
          achieved: response.data.current_value,
          remaining: response.data.remaining,
          isCompleted: response.data.is_completed
        };
        
        return this.goalProgress[id];
      } catch (error) {
        this.error = error.message;
        console.error('Failed to calculate goal progress:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    setCurrentGoal(goal) {
      this.currentGoal = { 
        id: goal.id_goal || goal.id, 
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