import db from '../config/connect.js';

// Fetch all goals of a house
export const getGoalsByHouseId = async (id_house) => {
    try {
        const [results] = await db.execute(
            'SELECT * FROM goals WHERE id_house = ?',
            [id_house]
        );
        return results;
    } catch (err) {
        console.error('Error fetching goals:', err);
        throw err;
    }
};

// Fetch a goal by house ID and goal ID
export const getGoalById = async (id_house, id_goal) => {
    try {
        const [results] = await db.execute(
            'SELECT * FROM goals WHERE id_house = ? AND id_goal = ?',
            [id_house, id_goal]
        );
        return results[0] || null;
    } catch (err) {
        console.error('Error fetching goal:', err);
        throw err;
    }
};

// Get total consumption for a specific day
export const getTotalConsumptionByDay = async (id_house, date) => {
    try {
        const [results] = await db.execute(
            `SELECT SUM(consumption_value) AS total 
             FROM consumption_readings 
             WHERE id_house = ? AND DATE(reading_date) = ?`,
            [id_house, date]
        );
        return results[0]?.total || 0;
    } catch (err) {
        console.error('Error fetching daily consumption:', err);
        throw err;
    }
};

// Get total consumption between two dates
export const getTotalConsumptionByPeriod = async (id_house, startDate, endDate) => {
    try {
        const [results] = await db.execute(
            `SELECT SUM(consumption_value) AS total 
             FROM consumption_readings 
             WHERE id_house = ? AND reading_date BETWEEN ? AND ?`,
            [id_house, startDate, endDate]
        );
        return results[0]?.total || 0;
    } catch (err) {
        console.error('Error fetching period consumption:', err);
        throw err;
    }
};

// Get total consumption between two exact date-times
export const getTotalConsumptionByDateTimeRange = async (id_house, startDateTime, endDateTime) => {
    try {
        const [results] = await db.execute(
            `SELECT SUM(consumption_value) AS total
             FROM consumption_readings
             WHERE id_house = ?
             AND reading_date BETWEEN ? AND ?`,
            [id_house, startDateTime, endDateTime]
        );
        return results[0]?.total || 0;
    } catch (err) {
        console.error('Error fetching datetime range consumption:', err);
        throw err;
    }
};

// Insert a new goal
export const createGoal = async (goalData) => {
    try {
        const [result] = await db.execute(
            `INSERT INTO goals (id_house, period_type, target_value, start_date, end_date) 
             VALUES (?, ?, ?, ?, ?)`,
            [goalData.id_house, goalData.period_type, goalData.target_value, 
             goalData.start_date, goalData.end_date]
        );

        return {
            id_goal: result.insertId,
            ...goalData
        };
    } catch (err) {
        console.error('Error inserting goal:', err);
        throw err;
    }
};

// Delete a goal
export const deleteGoal = async (id_house, id_goal) => {
    try {
        const [result] = await db.execute(
            'DELETE FROM goals WHERE id_house = ? AND id_goal = ?',
            [id_house, id_goal]
        );
        return result;
    } catch (err) {
        console.error('Error deleting goal:', err);
        throw err;
    }
};