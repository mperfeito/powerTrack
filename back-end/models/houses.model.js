import { DataTypes } from 'sequelize';
import sequelize from './db.js';

// Definir modelo House
const House = sequelize.define(
  "House",
  {
    id_house: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    id_user: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
    },
    postal_code: {
      type: DataTypes.STRING,
    },
    city: {
      type: DataTypes.STRING,
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "houses",
    timestamps: false,
  }
);

// Funções para exportar

export const getActiveHouse = async (userId) => {
  try {
    const house = await House.findOne({
      where: { id_user: userId, active: true },
      attributes: ["id_house"],
    });

    if (!house) {
      throw new Error("Nenhuma casa ativa encontrada.");
    }
    return house;
  } catch (err) {
    console.error("Erro ao buscar casa ativa:", err);
    throw err;
  }
};

export const createHouse = async (id, houseData) => {
  const { address, postal_code, city } = houseData;
  try {
    const newHouse = await House.create({
      id_user: id,
      address,
      postal_code,
      city,
      active: false,
    });
    console.log("House created with id:", newHouse.id_house);
    return newHouse.id_house;
  } catch (err) {
    console.error("Error creating house:", err);
    throw err;
  }
};

export const getHouses = async (id) => {
  try {
    return await House.findAll({
      where: { id_user: id },
    });
  } catch (err) {
    console.error("Error fetching houses:", err);
    throw err;
  }
};

export const getAllHouses = async () => {
  try {
    return await House.findAll();
  } catch (err) {
    console.error("Error fetching all houses:", err);
    throw err;
  }
};

export const updateHouse = async (id, houseId, houseData) => {
  const { address, postal_code, city } = houseData;
  try {
    const [affectedRows] = await House.update(
      { address, postal_code, city },
      { where: { id_house: houseId, id_user: id } }
    );
    return affectedRows > 0;
  } catch (err) {
    console.error("Error updating house:", err);
    throw err;
  }
};

export const deleteHouse = async (id, houseId) => {
  try {
    const affectedRows = await House.destroy({
      where: { id_house: houseId, id_user: id },
    });
    return affectedRows > 0;
  } catch (err) {
    console.error("Error deleting house:", err);
    throw err;
  }
};

export const findHouseByAddress = async (id, address) => {
  try {
    const house = await House.findOne({
      where: { id_user: id, address },
    });
    return house || null;
  } catch (err) {
    console.error("Error finding house by address:", err);
    throw err;
  }
};

export const findHouseById = async (id, houseId) => {
  try {
    const house = await House.findOne({
      where: { id_user: id, id_house: houseId },
    });
    return house || null;
  } catch (err) {
    console.error("Error finding house by id:", err);
    throw err;
  }
};

export const setHouseActive = async (userId, houseId) => {
  try {
    // Desativa todas as casas do user
    await House.update({ active: false }, { where: { id_user: userId } });

    // Ativa a casa selecionada
    const [affectedRows] = await House.update(
      { active: true },
      { where: { id_user: userId, id_house: houseId } }
    );

    return affectedRows > 0 ? { success: true, houseId } : null;
  } catch (err) {
    console.error("Erro ao ativar casa:", err);
    throw err;
  }
}; 

export const getAllActiveHouses = async () => {
  try {
    const [result] = await db.execute(
      "SELECT id_house, id_user FROM houses WHERE active = true"
    );
    return result;
  } catch (err) {
    console.error("Error fetching active houses:", err);
    throw err;
  }
};

export default House;