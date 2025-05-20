import db from '../config/connect.js';

// Fetch all goals of a house
export const getGoalsByHouseId = (id_house, callback) => {
  const query = 'SELECT * FROM goals WHERE id_house = ?';
  db.query(query, [id_house], (err, results) => {
    if (err) {
      console.error('Erro ao buscar metas no BD:', err);
      return callback(err, null);
    }

    return callback(null, results);
  });
};

// Fetch a goal by house ID and goal ID
export const getGoalById = (id_house, id_goal, callback) => {
    const query = 'SELECT * FROM goals WHERE id_house = ? AND id_goal = ?';
    db.query(query, [id_house, id_goal], (err, results) => {
        if (err) {
            console.error('Error fetching goal:', err);
            return callback(err, null);
        }
        if (!Array.isArray(results) || results.length === 0) {
            return callback(null, null);
        }
        return callback(null, results[0]);
    });
};

// Get total consumption for a specific day (used for daily goal or peak hour comparison)
export const getTotalConsumptionByDay = (id_house, date, callback) => {
    const sql = `
        SELECT SUM(consumption_value) AS total 
        FROM consumption_readings 
        WHERE id_house = ? AND DATE(reading_date) = ?
    `;
    db.query(sql, [id_house, date], (err, results) => {
        if (err) return callback(err);
        const total = results[0]?.total || 0;
        callback(null, total);
    });
};

// Get total consumption between two dates (used for weekly/monthly goals)
export const getTotalConsumptionByPeriod = (id_house, startDate, endDate, callback) => {
    const sql = `
        SELECT SUM(consumption_value) AS total 
        FROM consumption_readings 
        WHERE id_house = ? AND reading_date BETWEEN ? AND ?
    `;
    db.query(sql, [id_house, startDate, endDate], (err, results) => {
        if (err) return callback(err);
        const total = results[0]?.total || 0;
        callback(null, total);
    });
};

// Get total consumption between two exact date-times (used for peak hour calculations)
export const getTotalConsumptionByDateTimeRange = (id_house, startDateTime, endDateTime, callback) => {
    const sql = `
        SELECT SUM(consumption_value) AS total
        FROM consumption_readings
        WHERE id_house = ?
        AND reading_date BETWEEN ? AND ?
    `;

    db.query(sql, [id_house, startDateTime, endDateTime], (err, results) => {
        if (err) return callback(err);
        const total = results[0]?.total || 0;
        callback(null, total);
    });
};

// Insert a new goal
export const createGoal = (goalData, callback) => {
    const query = 'INSERT INTO goals (id_house, period_type, target_value, start_date, end_date) VALUES (?, ?, ?, ?, ?)';
    const values = [goalData.id_house, goalData.period_type, goalData.target_value, goalData.start_date, goalData.end_date];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error inserting goal:', err);
            return callback(err, null);
        }
        const goal = {
            id: result.insertId,
            id_house: goalData.id_house,
            period_type: goalData.period_type,
            target_value: goalData.target_value,
            start_date: goalData.start_date,
            end_date: goalData.end_date
        };

        callback(null, goal);
    });
};


// Delete a goal
export const deleteGoal = (id_house, id_goal, callback) => {
    const query = 'DELETE FROM goals WHERE id_house = ? AND id_goal = ?';
    db.query(query, [id_house, id_goal], (err, result) => {
        if (err) {
            callback(err, null);
        } else {
            callback(null, result);
        }
    });
};

