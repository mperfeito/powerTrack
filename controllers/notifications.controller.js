import {
  compareConsumption,
  getPeakHourConsumption,
} from "../models/notifications.model.js";

export async function notifyHighConsumption(req, res) {
  try {
    const houseId = await getActiveHouse(req.user.id);
    const { period } = req.query;

    if (!["day", "week", "month"].includes(period)) {
      return res.status(400).json({
        message: "Invalid period. Use 'day', 'week', or 'month'.",
      });
    }

    const result = await compareConsumption(houseId, period);

    if (result.percentage_change >= 10) {
      return res.json({
        message: `Warning: Consumption increased by ${result.percentage_change.toFixed(
          2
        )}% compared to the previous ${period}.`,
        data: {
          current: parseFloat(result.current).toFixed(2),
          previous: parseFloat(result.previous).toFixed(2),
          percentage_change:
            parseFloat(result.percentage_change).toFixed(2) + " %",
        },
      });
    }

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
}

export async function notifyLowConsumption(req, res) {
  try {
    const houseId = await getActiveHouse(req.user.id);

    const { period } = req.query;

    if (!["day", "week", "month"].includes(period)) {
      return res.status(400).json({
        message: "Invalid period. Use 'day', 'week', or 'month'.",
      });
    }

    const result = await compareConsumption(houseId, period);

    if (
      Math.abs(result.percentage_change) >= 10 &&
      result.percentage_change < 0
    ) {
      return res.json({
        message: `Good news: Consumption decreased by ${Math.abs(
          result.percentage_change
        ).toFixed(2)}% compared to the previous ${period}!`,
        data: {
          current: parseFloat(result.current).toFixed(2),
          previous: parseFloat(result.previous).toFixed(2),
          percentage_change:
            parseFloat(result.percentage_change).toFixed(2) + " %",
        },
      });
    }

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
}

export async function notifyPeak(req, res) {
  try {
    const houseId = await getActiveHouse(req.user.id);

    const result = await getPeakHourConsumption(houseId);

    if (result.hour) {
      return res.json({
        message: `Peak alert: Yesterday at ${result.hour}, a peak consumption of ${result.value} watts was recorded.`,
        data: result,
      });
    }

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
}
