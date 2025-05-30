// src/stores/goalsStore.js
import { defineStore } from 'pinia'
import goalsApi from '@/api/goals'

export const useGoalsStore = defineStore('goals', {
  state: () => ({
    goals: [],
    currentGoal: {
      id: null,
      targetValue: "",
      period: "monthly",
      startDate: "",
      endDate: "",
      currentValue: 0
    },
    isEditing: false
  }),

  getters: {
    isGoalValid: (state) => {
      return state.currentGoal.targetValue > 0 && 
             state.currentGoal.startDate && 
             state.currentGoal.endDate;
    },
    
    // You can add more getters as needed
    activeGoals: (state) => {
      const today = new Date().toISOString().split('T')[0];
      return state.goals.filter(goal => 
        goal.startDate <= today && goal.endDate >= today
      );
    }
  },

  actions: {
    async fetchGoals() {
      try {
        const response = await goalsApi.getGoals();
        // Fetch progress for each goal
        const goalsWithProgress = await Promise.all(
          response.data.goals.map(async goal => {
            const progress = await goalsApi.getGoalProgress(goal.id);
            return {
              ...goal,
              currentValue: progress.data.current_value || 0,
              period: goal.period_type,
              targetValue: goal.target_value
            };
          })
        );
        this.goals = goalsWithProgress;
      } catch (error) {
        console.error('Failed to fetch goals:', error);
        throw error;
      }
    },

    async fetchGoalById(id) {
      try {
        const response = await goalsApi.getGoalById(id);
        return response.data.goal;
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
          start_date: goalData.startDate,
          end_date: goalData.endDate
        });
        await this.fetchGoals();
        return response.data.goal;
      } catch (error) {
        console.error('Failed to create goal:', error);
        throw error;
      }
    },

    async updateGoal() {
      if (!this.currentGoal.id) return;
      
      try {
        const response = await goalsApi.updateGoal(this.currentGoal.id, {
          period_type: this.currentGoal.period,
          target_value: this.currentGoal.targetValue,
          start_date: this.currentGoal.startDate,
          end_date: this.currentGoal.endDate
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
      try {
        await goalsApi.deleteGoal(id);
        await this.fetchGoals();
      } catch (error) {
        console.error('Failed to delete goal:', error);
        throw error;
      }
    },

    setCurrentGoal(goal) {
      this.currentGoal = { 
        id: goal.id,
        targetValue: goal.targetValue,
        period: goal.period,
        startDate: goal.start_date,
        endDate: goal.end_date,
        currentValue: goal.currentValue || 0
      };
      this.isEditing = true;
    },

    resetCurrentGoal() {
      this.currentGoal = {
        id: null,
        targetValue: "",
        period: "monthly",
        startDate: "",
        endDate: "",
        currentValue: 0
      };
      this.isEditing = false;
    },

    // Helper action to calculate progress for display
    calculateProgress(goal) {
      return Math.min(Math.round((goal.currentValue / goal.targetValue) * 100), 100);
    }
  }
})