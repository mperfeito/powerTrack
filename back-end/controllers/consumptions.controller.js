import {
  insertConsumptions,
  getHouses,
  getLatest,
  comparePeriod,
  compareWithSimilarHouses,
  compareDevices,
  getConsumptions
} from "../models/consumptions.model.js";
import cron from "node-cron";
import { getActiveHouse } from "../models/houses.model.js";

export async function insertReadings() {
  cron.schedule("*/30 * * * *", async () => {
    try {
      const houses = await getHouses();
      if (!houses || houses.length === 0) {
        console.log("No houses found to insert readings.");
        return;
      }
      for (const house of houses) {
        if (!house.id_house) continue; 
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
    if (!req.user || !req.user.id_user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const activeHouse = await getActiveHouse(req.user.id_user);
    if (!activeHouse || !activeHouse.id_house) {
      return res.status(404).json({ message: "Active house not found" });
    }
    const houseId = activeHouse.id_house;

    const { period } = req.query;
    if (!period) {
      return res.status(400).json({ message: "Period query parameter is required" });
    }
    if (!["day", "week", "month"].includes(period)) {
      return res.status(400).json({ message: "Invalid period. Use 'day', 'week', or 'month'" });
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
    if (!req.user || !req.user.id_user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const activeHouse = await getActiveHouse(req.user.id_user);
    if (!activeHouse || !activeHouse.id_house) {
      return res.status(404).json({ message: "Active house not found" });
    }
    const houseId = activeHouse.id_house;

    const result = await compareWithSimilarHouses(houseId);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getDevices(req, res) {
  try {
    if (!req.user || !req.user.id_user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const activeHouse = await getActiveHouse(req.user.id_user);
    if (!activeHouse || !activeHouse.id_house) {
      return res.status(404).json({ message: "Active house not found" });
    }
    const houseId = activeHouse.id_house;

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
    if (!req.user || !req.user.id_user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    console.log("Utilizador autenticado:", req.user.id_user);

    const activeHouse = await getActiveHouse(req.user.id_user);
    if (!activeHouse || !activeHouse.id_house) {
      return res.status(404).json({ message: "Active house not found" });
    }
    const houseId = activeHouse.id_house;

    console.log("Casa ativa:", houseId);

    const result = await getLatest(houseId);
    console.log("Resultado final:", result);

    if (!result || result.length === 0)
      return res.status(404).json({ message: "No data found" });

    res.status(200).json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getConsumptionHistory(req, res) {
  try {
    if (!req.user || !req.user.id_user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const activeHouse = await getActiveHouse(req.user.id_user);
    if (!activeHouse || !activeHouse.id_house) {
      return res.status(404).json({ message: "Active house not found" });
    }
    const houseId = activeHouse.id_house;

    let limit = 8;
    if (req.query.limit) {
      limit = parseInt(req.query.limit);
      if (isNaN(limit) || limit <= 0) {
        return res.status(400).json({ message: "Limit must be a positive integer" });
      }
    }

    const history = await getConsumptions(houseId, limit);
    res.json(history.reverse()); 
  } catch (error) {
    console.error("Erro no getConsumptionHistoryController:", error);
    res.status(500).json({ message: "Erro ao buscar histórico de consumo" });
  }
}
