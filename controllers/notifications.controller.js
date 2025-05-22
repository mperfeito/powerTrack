// NOTIFICATIONS.CONTROLLER.JS
import {
  checkConsumptionChanges,
  getPeakHourConsumption,
  createNotification,
  getNotifications,
  deleteNotificationById
} from "../models/notifications.model.js";
import {  getActiveHouse } from "../models/houses.model.js";


export async function checkHighConsumption(req) {
  try {
    const { id_house: houseId } = await getActiveHouse(req.user.id_user);
    if (!houseId) {
      console.log("No active house found for the user.");
      return;
    }

    const results = await checkConsumptionChanges(houseId);

    for (const [period, data] of Object.entries(results)) {
      if (data.percentage_change >= 10) {
        const message =
          `High ${period}ly consumption: Increased by ${data.percentage_change.toFixed(
            2
          )}% ` +
          `(Current: ${data.current.toFixed(
            2
          )} vs Previous: ${data.previous.toFixed(2)})`;

        await createNotification(houseId, "high_consumption", message);
      }
    }
  } catch (error) {
    console.error("Error checking high consumption", error);
  }
}

export async function checkLowConsumption(req) {
  try {
    const { id_house: houseId } = await getActiveHouse(req.user.id_user);
    if (!houseId) {
      console.log("No active house found for the user.");
      return;
    }

    const results = await checkConsumptionChanges(houseId);

    for (const [period, data] of Object.entries(results)) {
      if (data.percentage_change <= -10) {
        const message =
          `Low ${period}ly consumption: Decreased by ${Math.abs(
            data.percentage_change
          ).toFixed(2)}% ` +
          `(Current: ${data.current.toFixed(
            2
          )} vs Previous: ${data.previous.toFixed(2)})`;

        await createNotification(houseId, "low_consumption", message);
      }
    }
  } catch (error) {
    console.error("Error checking low consumption", error);
  }
}

export async function checkPeakHours(req) {
  try {
    const { id_house: houseId } = await getActiveHouse(req.user.id_user);
    if (!houseId) {
      console.log("No active house found for the user.");
      return;
    }

    const result = await getPeakHourConsumption(houseId);

    if (result.hour) {
      const message = `Peak consumption: ${result.value.toFixed(
        2
      )} watts at ${result.hour}:00 yesterday`;

      await createNotification(houseId, "peak_consumption", message);
    }
  } catch (error) {
    console.error("Error checking peak", error);
  }
}

export async function sendNotifications(req, res) {
  try {
    await checkHighConsumption(req);
    await checkLowConsumption(req);
    await checkPeakHours(req);

    res.status(200).json({ message: "Notifications sent successfully" });
  } catch (err) {
    console.error("Error sending notifications", err);
    res.status(500).json({ error: "Error sending notifications" });
  }
}

export async function getAuthNotifications(req, res) {
  try {
    const { id_house: houseId } = await getActiveHouse(req.user.id_user);
    if (!houseId) {
      return res
        .status(404)
        .json({ error: "No active house found for the user." });
    }
    const notifications = await getNotifications(houseId);
    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching notifications..." });
  }
}

export async function deleteNotification(req, res) {
  try {
    const notificationId = req.params.id;
    await deleteNotificationById(notificationId);
    res.status(204).send();
  } catch (err) {
    console.error("Error deleting notification", err);
    res.status(500).json({ error: "Error deleting notification" });
  }
}
