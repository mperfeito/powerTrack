import db from "../config/connect.js";

export const getActiveHouse = async (userId) => {
  try {
    const [result] = await db.execute(
      "SELECT id FROM houses WHERE id_user = ? AND active = true LIMIT 1",
      [userId]
    );
    if (result.length === 0) {
      throw new Error("Nenhuma casa ativa encontrada.");
    }
    return result[0].id;
  } catch (err) {
    console.error("Erro ao buscar casa ativa:", err);
    throw err;
  }
};

export const createHouse = async (id, house) => {
  const { address, postal_code, city, country } = house;
  try {
    const [result] = await db.execute(
      "INSERT INTO houses (id_user, address, postal_code, city, country) VALUES (?,?,?,?,?)",
      [id, address, postal_code, city, country]
    );
    console.log("House created with id:", result.insertId);
    return result.insertId;
  } catch (err) {
    console.error("Error creating house:", err);
    throw err;
  }
};

export const getHouses = async (id) => {
  try {
    const [result] = await db.execute(
      "SELECT * FROM houses WHERE id_user = ?",
      [id]
    );
    return result;
  } catch (err) {
    console.log("Error fetching houses:", err);
    throw err;
  }
};

export const updateHouse = async (id, houseId, house) => {
  const { address, postal_code, city } = house;
  try {
    const [result] = await db.execute(
      "UPDATE houses SET address = ?, postal_code = ?, city = ? WHERE id_house = ? AND id_user = ?",
      [address, postal_code, city, houseId, id]
    );
    return result.affectedRows > 0;
  } catch (err) {
    console.error("Error updating house:", err);
    throw err;
  }
};

export const deleteHouse = async (id, houseId) => {
  try {
    const [result] = await db.execute(
      "DELETE FROM houses WHERE id_house = ? AND id_user = ?",
      [houseId, id]
    );
    return result.affectedRows > 0;
  } catch (err) {
    console.error("Error deleting house:", err);
    throw err;
  }
};

export const findHouseByAddress = async (id, address) => {
  try {
    const [result] = await db.execute(
      "SELECT * FROM houses WHERE id_user = ? AND address = ?",
      [id, address]
    );
    return result.length > 0 ? result[0] : null;
  } catch (err) {
    console.error("Error finding house by address:", err);
    throw err;
  }
};

export const findHouseById = async (id, houseId) => {
  try {
    const [result] = await db.execute(
      "SELECT * FROM houses WHERE id_user = ? AND id_house=?",
      [id, houseId]
    );
    return result.length > 0 ? result[0] : null;
  } catch (err) {
    console.error("Error finding house by id:", err);
    throw err;
  }
};

export const setHouseActive = async (userId, houseId) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    await connection.execute(
      "UPDATE houses SET active = false WHERE id_user = ?",
      [userId]
    );

    const [result] = await connection.execute(
      "UPDATE houses SET active = true WHERE id_user = ? AND id_house = ?",
      [userId, houseId]
    );

    await connection.commit();
    return result.affectedRows > 0;
  } catch (err) {
    await connection.rollback();
    console.error("Error to activate house:", err);
    throw err;
  } finally {
    connection.release();
  }
};