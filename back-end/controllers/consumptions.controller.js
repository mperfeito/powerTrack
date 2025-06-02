import {
  insertConsumptions,
  getHouses,
  getLatest,
  comparePeriod,
  compareWithSimilarHouses,
  compareDevices,
} from "../models/consumptions.model.js";
import cron from "node-cron";
import { getActiveHouse } from "../models/houses.model.js";

export async function insertReadings() {
  cron.schedule("*/2 * * * *", async () => {
    try {
      const houses = await getHouses();
      if (houses.length === 0) {
        console.log("No houses found to insert readings.");
        return;
      }
      for (const house of houses) {
        const randomValue = (Math.random() * 4 + 1).toFixed(2);
        await insertConsumptions(house.id_house, randomValue);
      }
    } catch (err) {
      console.error("Error inserting readings", err);
    }
  });
}

export async function getPeriod(req, res) {
  try {
 const { id_house: houseId } = await getActiveHouse(req.user.id_user);

    const { period } = req.query;

    if (!["day", "week", "month"].includes(period)) {
      return res
        .status(400)
        .json({ message: "Invalid period. Use 'day', 'week', or 'month'" });
    }
    const result = await comparePeriod(houseId, period);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getSimilarHouses(req, res) {
  try {
    const { id_house: houseId } = await getActiveHouse(req.user.id_user);

    const result = await compareWithSimilarHouses(houseId);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getDevices(req, res) {
  try {
const { id_house: houseId } = await getActiveHouse(req.user.id_user);

    const result = await compareDevices(houseId);
    res.json(result);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({
      message: error.message || "Failed to compare devices",
      error: error.message,
    });
  }
}

export async function latestReading(req, res) {
  try {
    console.log("Utilizador autenticado:", req.user.id_user);

    const { id_house: houseId } = await getActiveHouse(req.user.id_user);
    console.log("Casa ativa:", houseId);

    const result = await getLatest(houseId);
    console.log("Resultado final:", result);

    if (!result.length)
      return res.status(404).json({ message: "No data found" });

    res.status(200).json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}
