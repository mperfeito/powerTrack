// import db from '../config/connect.js';

// // Get all Appliances
// export const getAppliancesByHouseId = async (id_house) => {
//     try {
//         const [results] = await db.execute(
//             'SELECT * FROM appliances WHERE id_house = ?',
//             [id_house]
//         );
//         return results;
//     } catch (err) {
//         console.error('Error fetching appliances by house ID:', err);
//         throw err;
//     }
// };

// // Get Appliance By Id
// export const getApplianceById = async (id_house, id_appliance) => {
//     try {
//         const [results] = await db.execute(
//             'SELECT * FROM appliances WHERE id_house = ? AND id_appliance = ?',
//             [id_house, id_appliance]
//         );
//         return results[0] || null;
//     } catch (err) {
//         console.error('Error fetching appliance by ID:', err);
//         throw err;
//     }
// };

// // Add a new appliance to the house
// export const addAppliance = async (id_house, type, state, avg_operating_hours, nominal_power_watts) => {
//     try {
//         const [result] = await db.execute(
//             `INSERT INTO appliances (id_house, type, state, operating_hours, nominal_power_watts)
//              VALUES (?, ?, ?, ?, ?)`,
//             [id_house, type, state, avg_operating_hours, nominal_power_watts]
//         );

//         return {
//             id_appliance: result.insertId,
//             id_house,
//             type,
//             state,
//             operating_hours: avg_operating_hours,
//             nominal_power_watts
//         };
//     } catch (err) {
//         console.error('Error adding appliance:', err);
//         throw err;
//     }
// };

// // Delete an appliance by its ID
// export const deleteAppliance = async (houseId, applianceId) => {
//     try {
//         const [result] = await db.execute(
//             'DELETE FROM appliances WHERE id_house = ? AND id_appliance = ?',
//             [houseId, applianceId]
//         );
//         return result;
//     } catch (err) {
//         console.error('Error deleting appliance:', err);
//         throw err;
//     }
// };

// export const getApplianceByType = async (id_house, type) => {
//   try {
//     const [results] = await db.execute(
//       'SELECT * FROM appliances WHERE id_house = ? AND type = ?',
//       [id_house, type]
//     );
//     return results[0] || null;
//   } catch (err) {
//     console.error('Error fetching appliance by type:', err);
//     throw err;
//   }
// };

// models/appliances.model.js
import { DataTypes } from 'sequelize';
import sequelize from './db.js';

// Definir o modelo Appliance
const Appliance = sequelize.define('Appliance', {
  id_appliance: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  id_house: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  state: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  operating_hours: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  nominal_power_watts: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
}, {
  tableName: 'appliances',
  timestamps: false,
});

// Funções (antes usavam db.execute, agora usam Sequelize)
export const getAppliancesByHouseId = async (id_house) => {
  return await Appliance.findAll({ where: { id_house } });
};

export const getApplianceById = async (id_house, id_appliance) => {
  return await Appliance.findOne({
    where: { id_house, id_appliance }
  });
};

export const getApplianceByType = async (id_house, type) => {
  return await Appliance.findOne({
    where: { id_house, type }
  });
};

export const addAppliance = async (id_house, type, state, avg_operating_hours, nominal_power_watts) => {
  return await Appliance.create({
    id_house,
    type,
    state,
    operating_hours: avg_operating_hours,
    nominal_power_watts
  });
};

export const deleteAppliance = async (id_house, id_appliance) => {
  return await Appliance.destroy({
    where: { id_house, id_appliance }
  });
};

// Exportar também o modelo se quiseres usar diretamente noutros lugares
export default Appliance;
