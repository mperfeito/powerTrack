// src/api/goals.js
import api from '@/api/api'

export default {
    getGoals() {
        return api.get("/goals");  
    },

    getGoalById(id) {
        return api.get(`/goals/${id}`);
    },

    createGoal(goalData) {
        return api.post("/goals", goalData);
    },

    updateGoal(id, goalData) {
        return api.patch(`/goals/${id}`, goalData);
    },

    deleteGoal(id) {
        return api.delete(`/goals/${id}`);
    }, 
    getGoalsWithProgress() {
        return api.get('/goals', {
          params: { includeProgress: true }
        });
      }
}