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
    const house = getActiveHouse(req.user.id_user);
    res.json(house);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching house..." });
  }
};

export const setAuthActiveHouse = async (req, res) => {
  try {
    const activate = await setHouseActive(req.user.id_user, req.params.id);
    if (!activate) {
      res.status(404).json({ message: "House not found..." });
    }
    res.status(200).json({ message: "House successfully activated" });
  } catch (err) {
    console.error(err);
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
  const { address } = req.body;
  const existHouse = await findHouseByAddress(address);
  if (existHouse)
    return res
      .status(400)
      .json({ error: "House already registered at this address..." });
  try {
    const result = await createHouse(req.user.id_user, req.body);
    res.status(201).json({ message: "House created successfully", id: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creating houses..." });
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
    res.status(500).json({ error: "Error updating house..." });
  }
};
