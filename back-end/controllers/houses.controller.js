import {
  createHouse,
  getHouses,
  updateHouse,
  deleteHouse,
  findHouseByAddress,
  setHouseActive,
  getActiveHouse,
} from "../models/houses.model.js";

export const getAuthActiveHouse = async (req, res) => {
  try {
    const house = await getActiveHouse(req.user.id_user);

    if (!house) {
      return res.status(404).json({ error: "No active house found" });
    }

    res.status(200).json({ id_house: house.id_house });
  } catch (err) {
    console.error("Erro ao buscar casa ativa:", err);
    res.status(500).json({ error: "Error fetching active house..." });
  }
};

export const setAuthActiveHouse = async (req, res) => {
  const houseId = req.params.id;
  const userId = req.user.id_user;

  if (!houseId) {
    return res.status(400).json({ error: "Missing house ID" });
  }

  try {
    const houses = await getHouses(userId);
    const house = houses.find(h => h.id_house == houseId);

    if (!house) {
      return res.status(404).json({ error: "House not found or not owned by user" });
    }

    const currentActive = await getActiveHouse(userId);
    if (currentActive?.id_house == houseId) {
      return res.status(200).json({ message: "House already active", id_house: houseId });
    }

    await setHouseActive(userId, houseId);
    res.status(200).json({ message: "House activated successfully", id_house: houseId });
  } catch (err) {
    console.error("Erro ao ativar casa:", err);
    res.status(500).json({ error: "Error activating house..." });
  }
};

export const getAuthHouses = async (req, res) => {
  try {
    const houses = await getHouses(req.user.id_user);
    res.status(200).json(houses);
  } catch (err) {
    console.error("Erro ao buscar casas:", err);
    res.status(500).json({ error: "Error fetching houses..." });
  }
};

export const postAuthHouse = async (req, res) => {
  const { address, postal_code, city } = req.body;

  if (!address || !postal_code || !city) {
    return res.status(400).json({ error: "Missing required fields (address, postal_code, city)" });
  }

  try {
    const existing = await findHouseByAddress(req.user.id_user, address);
    if (existing) {
      return res.status(400).json({ error: "House already registered at this address..." });
    }

    const result = await createHouse(req.user.id_user, { address, postal_code, city });
    res.status(201).json({ message: "House created successfully", id: result });
  } catch (err) {
    console.error("Erro ao criar casa:", err);
    res.status(500).json({ error: "Error creating house..." });
  }
};

export const putAuthHouse = async (req, res) => {
  const houseId = req.params.id;
  const { address, postal_code, city } = req.body;

  if (!address || !postal_code || !city) {
    return res.status(400).json({ error: "Missing required fields (address, postal_code, city)" });
  }

  try {
    const houses = await getHouses(req.user.id_user);
    const house = houses.find(h => h.id_house == houseId);

    if (!house) {
      return res.status(404).json({ error: "House not found or not authorized" });
    }

    const duplicate = await findHouseByAddress(req.user.id_user, address);
    if (duplicate && duplicate.id_house != houseId) {
      return res.status(400).json({ error: "Another house already registered at this address..." });
    }

    await updateHouse(req.user.id_user, houseId, { address, postal_code, city });
    res.status(200).json({ message: "House updated" });
  } catch (err) {
    console.error("Erro ao atualizar casa:", err);
    res.status(500).json({ error: "Error updating house..." });
  }
};

export const deleteAuthHouse = async (req, res) => {
  const houseId = req.params.id;
  const userId = req.user.id_user;

  if (!houseId) {
    return res.status(400).json({ error: "Missing house ID" });
  }

  try {
    const houses = await getHouses(userId);
    const house = houses.find(h => h.id_house == houseId);

    if (!house) {
      return res.status(404).json({ error: "House not found or not authorized" });
    }

    const activeHouse = await getActiveHouse(userId);
    if (activeHouse?.id_house == houseId) {
      return res.status(400).json({ error: "Cannot delete active house" });
    }

    await deleteHouse(userId, houseId);
    res.status(204).send();
  } catch (err) {
    console.error("Erro ao apagar casa:", err);
    res.status(500).json({ error: "Error deleting house..." });
  }
};
