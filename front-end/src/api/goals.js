// src/api/goals.js
import api from '@/api/api'

export default {
    // GET /api/goals
    getGoals() {
        return api().get("goals");
    },

    // GET /api/goals/:id
    getGoalById(id) {
        return api().get(`goals/${id}`);
    },

    // GET /api/goals/:id/calculate-progress
    getGoalProgress(id) {
        return api().get(`goals/${id}/calculate-progress`);
    },

    // POST /api/goals
    createGoal(goalData) {
        return api().post("goals", goalData);
    },

    // PUT /api/goals/:id
    updateGoal(id, goalData) {
        return api().put(`goals/${id}`, goalData);
    },

    // DELETE /api/goals/:id
    deleteGoal(id) {
        return api().delete(`goals/${id}`);
    }
}