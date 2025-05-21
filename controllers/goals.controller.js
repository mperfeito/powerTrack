import * as goalsModel from '../models/goals.model.js';
import { getActiveHouse } from '../models/houses.model.js';

// Calculate if the goal was completed
export const calculateGoalStatus = async (id_house, goal) => {
    try {
        // When goal is 'daily'
        if (goal.period_type === 'daily') {
            const today = new Date().toISOString().slice(0, 10);
            const total = await goalsModel.getTotalConsumptionByDay(id_house, today);
            const completed = (total || 0) <= goal.target_value;
            return { ...goal, completed };
        }

        // When goal is 'monthly_reduction'
        if (goal.period_type === 'monthly_reduction') {
            const reductionPercentage = goal.target_value / 100;
            const today = new Date();
            
            const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            const currentMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            const previousMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const previousMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

            const currentConsumption = await goalsModel.getTotalConsumptionByPeriod(
                id_house, 
                currentMonthStart.toISOString().slice(0, 10), 
                currentMonthEnd.toISOString().slice(0, 10)
            );

            const referenceConsumption = await goalsModel.getTotalConsumptionByPeriod(
                id_house, 
                previousMonthStart.toISOString().slice(0, 10), 
                previousMonthEnd.toISOString().slice(0, 10)
            );

            const allowedLimit = referenceConsumption * (1 - reductionPercentage);
            const completed = currentConsumption <= allowedLimit;
            return { ...goal, completed };
        }

        // When goal is 'weekly_reduction'
        if (goal.period_type === 'weekly_reduction') {
            const reductionPercentage = goal.target_value / 100;
            const today = new Date();
            
            const currentWeekStart = new Date(today);
            currentWeekStart.setDate(today.getDate() - today.getDay());
            const currentWeekEnd = new Date(currentWeekStart);
            currentWeekEnd.setDate(currentWeekStart.getDate() + 6);

            const previousWeekStart = new Date(currentWeekStart);
            previousWeekStart.setDate(previousWeekStart.getDate() - 7);
            const previousWeekEnd = new Date(currentWeekEnd);
            previousWeekEnd.setDate(previousWeekEnd.getDate() - 7);

            const currentConsumption = await goalsModel.getTotalConsumptionByPeriod(
                id_house,
                currentWeekStart.toISOString().slice(0, 10),
                currentWeekEnd.toISOString().slice(0, 10)
            );

            const referenceConsumption = await goalsModel.getTotalConsumptionByPeriod(
                id_house,
                previousWeekStart.toISOString().slice(0, 10),
                previousWeekEnd.toISOString().slice(0, 10)
            );

            const allowedLimit = referenceConsumption * (1 - reductionPercentage);
            const completed = currentConsumption <= allowedLimit;
            return { ...goal, completed };
        }

        // When goal is 'monthly'
        if (goal.period_type === 'monthly') {
            const today = new Date();
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

            const total = await goalsModel.getTotalConsumptionByPeriod(
                id_house,
                startOfMonth.toISOString().slice(0, 10),
                endOfMonth.toISOString().slice(0, 10)
            );

            const completed = total <= goal.target_value;
            return { ...goal, completed };
        }

        // When goal is 'peak_hour'
        if (goal.period_type === 'peak_hour') {
            const today = new Date().toISOString().slice(0, 10);
            const total = await goalsModel.getTotalConsumptionByDay(id_house, today);
            
            const peakHourStart = `${today}T18:00:00`;
            const peakHourEnd = `${today}T21:00:00`;
            
            const peakConsumption = await goalsModel.getTotalConsumptionByDateTimeRange(
                id_house, 
                peakHourStart, 
                peakHourEnd
            );

            const allowedPeakConsumption = total * (goal.target_value / 100);
            const completed = peakConsumption <= allowedPeakConsumption;
            return { ...goal, completed };
        }

        return { ...goal, completed: false };
    } catch (err) {
        console.error('Error calculating goal status:', err);
        return { ...goal, completed: false };
    }
};

// Get all goals from a house
export const getAllGoals = async (req, res) => {
    try {
        const { id_house } = await getActiveHouse(req.user.id_user);
        const goals = await goalsModel.getGoalsByHouseId(id_house);

        if (!goals || goals.length === 0) {
            return res.status(404).json({ message: 'No goals found for this house' });
        }

        const goalsWithStatus = await Promise.all(
            goals.map(goal => calculateGoalStatus(id_house, goal))
        );
        res.status(200).json({ goals: goalsWithStatus });
    } catch (err) {
        console.error('Error fetching goals:', err);
        res.status(500).json({ errorMessage: 'Internal server error' });
    }
};

// Get a specific goal by ID
export const getGoalById = async (req, res) => {
    try {
        const { id_house } = await getActiveHouse(req.user.id_user);
        const { id_goal } = req.params;
        
        const goal = await goalsModel.getGoalById(id_house, id_goal);
        
        if (!goal) {
            return res.status(404).json({ message: 'Goal not found for this house' });
        }

        const goalWithStatus = await calculateGoalStatus(id_house, goal);
        res.status(200).json({ goal: goalWithStatus });
    } catch (err) {
        console.error('Error fetching goal:', err);
        res.status(500).json({ errorMessage: 'Internal server error' });
    }
};

// Add a new goal
export const addGoal = async (req, res) => {
    try {
        const { id_house } = await getActiveHouse(req.user.id_user);
        const { period_type, target_value, start_date, end_date } = req.body;

        if (!period_type || !target_value) {
            return res.status(400).json({ 
                errorMessage: 'Period type and target value are required' 
            });
        }

        const newGoal = {
            id_house,
            period_type,
            target_value,
            start_date: start_date || null,
            end_date: end_date || null
        };

        const insertedGoal = await goalsModel.createGoal(newGoal);
        res.status(201).json({ 
            message: 'Resource successfully created', 
            goal: insertedGoal 
        });
    } catch (err) {
        console.error('Error creating goal:', err);
        res.status(500).json({ errorMessage: 'Failed to create goal' });
    }
};

// Delete a goal
export const deleteGoal = async (req, res) => {
    try {
        const { id_house } = await getActiveHouse(req.user.id_user);
        const { id_goal } = req.params;
        
        const result = await goalsModel.deleteGoal(id_house, id_goal);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                errorMessage: 'Goal not found to delete' 
            });
        }

        res.status(204).json();
    } catch (err) {
        console.error('Error deleting goal:', err);
        res.status(500).json({ errorMessage: 'Failed to process request' });
    }
};