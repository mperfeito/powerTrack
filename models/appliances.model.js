import db from '../config/connect.js';

// Get all Appliances
export const getAppliancesByHouseId = (id_house, callback) => {
    const sql = 'SELECT * FROM appliances WHERE id_house = ?';
    db.query(sql, [id_house], (err, results) => {
        if (err) return callback(err);
        callback(null, results);
    });
};

// Get Appliance By Id
export const getApplianceById = (id_house, id_appliance, callback) => {
    const sql = 'SELECT * FROM appliances WHERE id_house = ? AND id_appliance = ?';
    db.query(sql, [id_house, id_appliance], (err, result) => {
        if (err) return callback(err);
        callback(null, result[0]); 
    });
};

// Add a new appliance to the house
export const addAppliance = (id_house, type, state, avg_operating_hours, nominal_power_watts, callback) => {
    const query = `
        INSERT INTO appliances (id_house, type, state, operating_hours, nominal_power_watts)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(query, [id_house, type, state, avg_operating_hours, nominal_power_watts], (err, result) => {
        if (err) {
            return callback(err, null);
        }

        // Return the created appliance with its new id
        const newAppliance = {
            id_appliance: result.insertId,
            id_house,
            type,
            state,
            operating_hours: avg_operating_hours,
            nominal_power_watts
        };
        callback(null, newAppliance);
    });
};

// Delete an appliance by its ID
export const deleteAppliance = (houseId, applianceId, callback) => {
    const query = 'DELETE FROM appliances WHERE id_house = ? AND id_appliance = ?';

    db.query(query, [houseId, applianceId], (err, result) => {
        if (err) {
            return callback(err, null);
        }

        // Return the result to indicate how many rows were affected
        callback(null, result);
    });
};
