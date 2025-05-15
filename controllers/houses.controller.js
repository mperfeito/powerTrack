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
    res.status(500).json({ error: "Error fetching house..." });
  }
};

export const setAuthActiveHouse = async (req, res) => {
  const houseId = req.params.id;
  const userId = req.user.id_user;

  try {
    await setHouseActive(userId, houseId);
    res.status(200).json({ message: "Casa ativada com sucesso", id_house: `${houseId}` });
  } catch (err) {
    console.error("Erro ao ativar casa:", err.message);
    res.status(500).json({ error: "Error activating house..." });
  }
};


export const getAuthHouses = async (req, res) => {
  try {
    const result = await getHouses(req.user.id_user);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching houses..." });
  }
};

export const postAuthHouse = async (req, res) => {
  const { address, postal_code, city } = req.body;

  try {
    const existHouse = await findHouseByAddress(req.user.id_user, address);
    if (existHouse) {
      return res
        .status(400)
        .json({ error: "House already registered at this address..." });
    }
    const result = await createHouse(req.user.id_user, {
      address,
      postal_code,
      city
    });
    res.status(201).json({ message: "House created successfully", id: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creating house..." });
  }
};

export const putAuthHouse = async (req, res) => {
  try {
    const result = await updateHouse(req.user.id_user, req.params.id, req.body);
    if (!result) {
      return res
        .status(404)
        .json({ error: "House not found or not authorized" });
    }
    res.status(200).json({ message: "House updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error updating house..." });
  }
};

export const deleteAuthHouse = async (req, res) => {
  console.log(req.user.id_user);
  try {
    const result = await deleteHouse(req.user.id_user, req.params.id);
    if (!result) {
      return res
        .status(404)
        .json({ error: "House not found or not authorized" });
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting house..." });
  }
};
