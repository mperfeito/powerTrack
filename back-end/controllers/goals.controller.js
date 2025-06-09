//GOALS.CONTROLLER.JS
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
        const { completed } = await calculateWeeklyReduction(id_house, goal);
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

// Update a goal 
export const updateGoal = async (req, res) => {  
    try {
        const { id_house } = await getActiveHouse(req.user.id_user);
        const { id_goal } = req.params;
        const { period_type, target_value, start_date, end_date } = req.body;

        if (!period_type || !target_value) {
            return res.status(400).json({ 
                errorMessage: 'Period type and target value are required' 
            });
        }
        const formatDate = (dateString) => {
            if (!dateString) return null;
            return new Date(dateString).toISOString().slice(0, 10);
        };

        const updatedGoal = {
            period_type,
            target_value,
            start_date: formatDate(start_date),
            end_date: formatDate(end_date)
        };

        const result = await goalsModel.updateGoal(id_house, id_goal, updatedGoal);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                errorMessage: 'Goal not found to update' 
            });
        }

        res.status(200).json({ 
            message: 'Resource successfully updated', 
            goal: { ...updatedGoal, id_goal } 
        });
    } catch (err) {
        console.error('Error updating goal:', err);
        res.status(500).json({ errorMessage: 'Failed to update goal' });
    }
}

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


//////////////////////////////////////////////// ALL THE LOGIC FOR THE PROGRESS OF A GOAL DEPENDING ON THE CONSUMPTION VALUE //////////////////////////////////////
export const calculateGoalProgress = async (req, res) => {
    try {
        const { id_house } = await getActiveHouse(req.user.id_user);
        const { id_goal } = req.params;
        
        const goal = await goalsModel.getGoalById(id_house, id_goal);
        
        if (!goal) {
            return res.status(404).json({ message: 'Goal not found for this house' });
        }

        // Daily Goal Calculation
        if (goal.period_type === 'daily') {
            const today = new Date().toISOString().slice(0, 10);
            const current = await goalsModel.getTotalConsumptionByDay(id_house, today);
            
            const progressData = {
                goal,
                current_value: current,
                progress_percentage: Math.min((current / goal.target_value) * 100, 100),
                remaining: Math.max(goal.target_value - current, 0),
                is_completed: current <= goal.target_value,
            };
            
            return res.status(200).json(progressData);
        }

        // Weekly Reduction Goal Calculation
        if (goal.period_type === 'weekly_reduction') {
            const reductionPercentage = goal.target_value / 100;
            
            // Calculate current week range
            const today = new Date();
            const currentWeekStart = new Date(today);
            currentWeekStart.setDate(today.getDate() - today.getDay());
            const currentWeekEnd = new Date(currentWeekStart);
            currentWeekEnd.setDate(currentWeekStart.getDate() + 6);
            
            // Calculate previous week range
            const previousWeekStart = new Date(currentWeekStart);
            previousWeekStart.setDate(previousWeekStart.getDate() - 7);
            const previousWeekEnd = new Date(currentWeekEnd);
            previousWeekEnd.setDate(previousWeekEnd.getDate() - 7);
            
            // Get consumptions in parallel
            const [currentConsumption, referenceConsumption] = await Promise.all([
                goalsModel.getTotalConsumptionByPeriod(id_house, currentWeekStart.toISOString().slice(0, 10), currentWeekEnd.toISOString().slice(0, 10)),
                goalsModel.getTotalConsumptionByPeriod(id_house, previousWeekStart.toISOString().slice(0, 10), previousWeekEnd.toISOString().slice(0, 10))
            ]);
            
            // Handle no reference data
            if (referenceConsumption === 0) {
                return res.status(200).json({
                    goal,
                    current_value: currentConsumption,
                    reference_value: 0,
                    allowed_limit: 0,
                    progress_percentage: 0,
                    remaining: 0,
                    is_completed: false,
                    days_remaining: 7 - new Date().getDay()
                });
            }
            
            // Calculate progress
            const allowedLimit = referenceConsumption * (1 - reductionPercentage);
            const progressPercentage = (currentConsumption / allowedLimit) * 100;
            
            return res.status(200).json({
                goal,
                current_value: currentConsumption,
                reference_value: referenceConsumption,
                allowed_limit: allowedLimit,
                progress_percentage: Math.min(progressPercentage, 100),
                remaining: Math.max(allowedLimit - currentConsumption, 0),
                is_completed: currentConsumption <= allowedLimit,
                days_remaining: 7 - new Date().getDay()
            });
        }

        // Monthly Reduction Goal Calculation
        if (goal.period_type === 'monthly_reduction') {
            const reductionPercentage = goal.target_value / 100;

            // Use goal's end_date as reference for the target month
            const evaluationDate = new Date(goal.end_date);

            // Target month (goal period)
            const targetMonthStart = new Date(evaluationDate.getFullYear(), evaluationDate.getMonth(), 1);
            const targetMonthEnd = new Date(evaluationDate.getFullYear(), evaluationDate.getMonth() + 1, 0);

            // Reference month (previous month)
            const referenceMonthStart = new Date(evaluationDate.getFullYear(), evaluationDate.getMonth() - 1, 1);
            const referenceMonthEnd = new Date(evaluationDate.getFullYear(), evaluationDate.getMonth(), 0);

            // Get consumption values
            const [targetMonthConsumption, referenceMonthConsumption] = await Promise.all([
                goalsModel.getTotalConsumptionByPeriod(id_house, targetMonthStart.toISOString().slice(0, 10), targetMonthEnd.toISOString().slice(0, 10)),
                goalsModel.getTotalConsumptionByPeriod(id_house, referenceMonthStart.toISOString().slice(0, 10), referenceMonthEnd.toISOString().slice(0, 10))
            ]);

            // No reference data
            if (referenceMonthConsumption === 0) {
                const lastDayOfTargetMonth = new Date(evaluationDate.getFullYear(), evaluationDate.getMonth() + 1, 0);
                // const daysRemaining = lastDayOfTargetMonth.getDate() - evaluationDate.getDate();

                return res.status(200).json({
                    goal,
                    current_value: targetMonthConsumption,
                    reference_value: 0,
                    allowed_limit: 0,
                    progress_percentage: 0,
                    remaining: 0,
                    is_completed: false,
                    // days_remaining: daysRemaining,
                    reduction_target: `${goal.target_value}% reduction`
                });
            }

            // Calculate metrics
            const allowedLimit = referenceMonthConsumption * (1 - reductionPercentage);
            const progressPercentage = (targetMonthConsumption / allowedLimit) * 100;
            const lastDayOfTargetMonth = new Date(evaluationDate.getFullYear(), evaluationDate.getMonth() + 1, 0);
            // const daysRemaining = lastDayOfTargetMonth.getDate() - evaluationDate.getDate();

            return res.status(200).json({
                goal,
                current_value: targetMonthConsumption,
                reference_value: referenceMonthConsumption,
                allowed_limit: allowedLimit,
                progress_percentage: Math.min(progressPercentage, 100),
                remaining: Math.max(allowedLimit - targetMonthConsumption, 0),
                is_completed: targetMonthConsumption <= allowedLimit,
                // days_remaining: daysRemaining,
                reduction_target: `${goal.target_value}% reduction`
            });
        }


        // Monthly Goal Calculation
        if (goal.period_type === 'monthly') {
            // Use the goal's period for consumption calculation
            const periodStart = new Date(goal.start_date);
            const periodEnd = new Date(goal.end_date);

            // Get current date to calculate days remaining only if within period
            const today = new Date();

            // Fetch consumption in the goal's period
            const currentConsumption = await goalsModel.getTotalConsumptionByPeriod(id_house, periodStart.toISOString().slice(0, 10), periodEnd.toISOString().slice(0, 10));

            // Calculate days remaining only if 'today' is within the goal period
            // let daysRemaining = 0;
            // if (today >= periodStart && today <= periodEnd) {
            //     daysRemaining = Math.ceil((periodEnd - today) / (1000 * 60 * 60 * 24));
            // }

            // Parse target value as number
            const targetValue = parseFloat(goal.target_value);

            return res.status(200).json({
                goal,
                current_value: currentConsumption,
                target_value: targetValue,
                progress_percentage: Math.min((currentConsumption / targetValue) * 100, 100),
                remaining: Math.max(targetValue - currentConsumption, 0),
                is_completed: currentConsumption <= targetValue,
                // days_remaining: daysRemaining
            });
        }


        return res.status(400).json({ message: 'Unsupported goal type' });
        
    } catch (err) {
        console.error('Error calculating goal progress:', err);
        res.status(500).json({ errorMessage: 'Internal server error' });
    }
};
