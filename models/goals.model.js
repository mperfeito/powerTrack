// models/goals.model.js
import { DataTypes } from 'sequelize';
import sequelize from './db.js';

const Goal = sequelize.define('Goal', {
  id_goal: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  id_house: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  period_type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  target_value: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  start_date: {
    type: DataTypes.DATE,
    allowNull: true,    
  },
  end_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'goals',
  timestamps: false
});

export const getGoalsByHouseId = async (id_house) => {
  return await Goal.findAll({ where: { id_house } });
};

export const getGoalById = async (id_house, id_goal) => {
  return await Goal.findOne({ where: { id_house, id_goal } });
};

export const createGoal = async (goalData) => {
  const newGoal = await Goal.create(goalData);
  return newGoal;
};

export const deleteGoal = async (id_house, id_goal) => {
  return await Goal.destroy({ where: { id_house, id_goal } });
};

// Leitura agregada (não exige criar um modelo separado)
import sequelizeInstance from './db.js';

export const getTotalConsumptionByDay = async (id_house, date) => {
  const [result] = await sequelizeInstance.query(
    `SELECT SUM(consumption_value) AS total 
     FROM consumption_readings 
     WHERE id_house = ? AND DATE(reading_date) = ?`,
    { replacements: [id_house, date], type: sequelizeInstance.QueryTypes.SELECT }
  );
  return result?.total || 0;
};

export const getTotalConsumptionByPeriod = async (id_house, startDate, endDate) => {
  const [result] = await sequelizeInstance.query(
    `SELECT SUM(consumption_value) AS total 
     FROM consumption_readings 
     WHERE id_house = ? AND reading_date BETWEEN ? AND ?`,
    { replacements: [id_house, startDate, endDate], type: sequelizeInstance.QueryTypes.SELECT }
  );
  return result?.total || 0;
};

export const getTotalConsumptionByDateTimeRange = async (id_house, startDateTime, endDateTime) => {
  const [result] = await sequelizeInstance.query(
    `SELECT SUM(consumption_value) AS total 
     FROM consumption_readings 
     WHERE id_house = ? AND reading_date BETWEEN ? AND ?`,
    { replacements: [id_house, startDateTime, endDateTime], type: sequelizeInstance.QueryTypes.SELECT }
  );
  return result?.total || 0;
};

export const getCurrentDayProgress = async (id_house) => {
  const today = new Date().toISOString().slice(0, 10);
  const results = await sequelizeInstance.query(
    `SELECT HOUR(reading_date) as hour, SUM(consumption_value) as consumption
     FROM consumption_readings
     WHERE id_house = ? AND DATE(reading_date) = ?
     GROUP BY HOUR(reading_date)
     ORDER BY hour`,
    {
      replacements: [id_house, today],
      type: sequelizeInstance.QueryTypes.SELECT
    }
  );
  return results;
};

// Exporta o modelo
export default Goal;
