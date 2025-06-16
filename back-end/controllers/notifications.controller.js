import moment from "moment";
import {
  getPeakHourConsumption,
  createNotification,
  getNotifications,
  deleteNotificationById, 
  getLastNotificationDate,
  getConsumptionByPeriod, 
} from "../models/notifications.model.js";
import { getActiveHouse } from "../models/houses.model.js";
import * as goalsModel from "../models/goals.model.js";
import { calculateGoalStatus } from "../controllers/goals.controller.js";

async function createUniqueNotification(houseId, type, message) {
  try {
    const notifications = await getNotifications(houseId);
    const exists = notifications.some(
      (n) => n.type === type && n.message === message
    );
    if (!exists) {
      await createNotification(houseId, type, message);
    }
} catch (error) {
    console.error(`Error creating notification for house ${houseId}:`, error);
  }
}

async function checkConsumptionChanges(houseId) {
  const now = moment();
  const results = {};

  const periods = ["day", "week", "month"];
  for (const period of periods) {
    const previous = moment(now).subtract(1, period);
    const current = await getConsumptionByPeriod(houseId, period, now);
    const prev = await getConsumptionByPeriod(houseId, period, previous);

    const difference = current - prev;
    let percentage_change = prev !== 0 ? (difference / prev) * 100 : 0;
    
    percentage_change = Math.min(Math.max(percentage_change, -100), 100);

    results[period] = {
      current,
      previous: prev,
      difference,
      percentage_change,
    };
  }

  return results;  
}

async function checkHighConsumptionForHouse(houseId) {
  if (!houseId) return;
  try {
    const results = await checkConsumptionChanges(houseId);
    for (const [period, data] of Object.entries(results)) {
      if (data.percentage_change >= 10) {
        const message = `High ${period}ly consumption: Increased by ${data.percentage_change.toFixed(2)}%`;
        await createUniqueNotification(houseId, "high_consumption", message);
      }
    }
  } catch (error) { 
    console.error(`Error checking high consumption for house ${houseId}:`, error);
  }
}

async function checkLowConsumptionForHouse(houseId) {
  if (!houseId) return;
  try {
    const results = await checkConsumptionChanges(houseId);
    for (const [period, data] of Object.entries(results)) {
      if (data.percentage_change <= -10) {
        const message = `Low ${period}ly consumption: Decreased by ${Math.abs(data.percentage_change).toFixed(2)}%`;
        await createUniqueNotification(houseId, "low_consumption", message);
      }
    }
  } catch (error) {
    console.error(`Error checking low consumption for house ${houseId}:`, error);
  }
}

async function checkPeakHoursForHouse(houseId) {
  if (!houseId) return;
  
  try {
    const result = await getPeakHourConsumption(houseId);    
    if (result && result.hour !== null && result.hour !== undefined && result.value > 0) {
      const numericValue = typeof result.value === 'string' 
        ? parseFloat(result.value) 
        : result.value;
      
      const formattedHour = result.hour < 10 ? `0${result.hour}` : result.hour;
      const message = `Peak consumption: ${numericValue.toFixed(2)} watts at ${formattedHour}:00 yesterday`;
      await createUniqueNotification(houseId, "peak_consumption", message);
    } else {
      console.log(`[Peak Hour] No valid peak hour data found for house ${houseId}`);
    }
  } catch (error) {
    console.error(`[Peak Hour] Error checking peak hours for house ${houseId}:`, error);
  }
}


async function checkGoalsForHouse(houseId, userId) {
  if (!houseId) return;
  try {
    const goals = await getGoalsByHouseId(houseId);
    if (goals.length === 0) return;

    for (const goal of goals) {
      const goalWithStatus = await calculateGoalStatus(houseId, goal);
      const previousStatus = await getGoalStatus(houseId, goal.id_goal);

      if (goalWithStatus.completed && (!previousStatus || !previousStatus.completed)) {
        const message = getCompletionMessage(goal);
        await createUniqueNotification(houseId, "goal_completed", message);
        await updateGoalStatus(houseId, goal.id_goal, true);
      } else if (previousStatus?.completed && !goalWithStatus.completed) {
        await updateGoalStatus(houseId, goal.id_goal, false);
      }
    }
  } catch (error) {
    console.error(`Error checking goals for house ${houseId}:`, error);
  }
}


function getCompletionMessage(goal) {
  const target = goal.target_value;
  const unit = goal.period_type === "peak_hour" ? "%" : "watts";

  const messages = {
    daily: `Daily goal completed! Consumption stayed below ${target}${unit} today.`,
    monthly: `Monthly goal completed! Consumption stayed below ${target}${unit} this month.`,
    monthly_reduction: `Monthly reduction goal completed! Achieved ${target}% reduction compared to last month.`,
    weekly_reduction: `Weekly reduction goal completed! Achieved ${target}% reduction compared to last week.`,
    peak_hour: `Peak hour goal completed! Consumption during peak hours was below ${target}% of daily total.`,
  };

  return messages[goal.period_type] || `Goal completed! Target was ${target}${unit}.`;
}


export async function sendNotifications(req, res) {
  try {
    const activeHouse = await getActiveHouse(req.user.id_user);

    if (!activeHouse?.id_house) {
      console.log("[Notification System] No active house found for user");
      return res.status(404).json({ error: "No active house found" });
    }

    const { id_house: houseId, id_user: userId } = activeHouse;
    const lastNotificationDate = await getLastNotificationDate(houseId);
    const lastNotified = lastNotificationDate ? moment(lastNotificationDate) : null;
    const today = moment().startOf('day');

    if (lastNotified && lastNotified.isSameOrAfter(today)) {
      console.log(`[Notification System] Notifications already sent today for house ${houseId}`);
      const existing = await getNotifications(houseId);
      return res.status(200).json({
        message: "Notifications already sent today",
        notifications: existing,
      });
    }

    await checkHighConsumptionForHouse(houseId);
    await checkLowConsumptionForHouse(houseId);
    await checkPeakHoursForHouse(houseId);
    await checkGoalsForHouse(houseId, userId);

    const allNotifications = await getNotifications(houseId);
    res.status(200).json({
      message: "Notifications sent successfully",
      notifications: allNotifications,
    });
  } catch (err) {
    console.error("[Notification System Error]:", err);
    res.status(500).json({ error: "Error sending notifications" });
  }
}

export async function getAuthNotifications(req, res) {
  try {
    const activeHouse = await getActiveHouse(req.user.id_user);
    if (!activeHouse?.id_house) {
      return res.status(404).json({ error: "No active house found" });
    }
    const notifications = await getNotifications(activeHouse.id_house);
    res.json(notifications);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ error: "Error fetching notifications" });
  }
}

export async function deleteNotification(req, res) {
  try {
    const notificationId = req.params.id;
    if (!notificationId) {
      return res.status(400).json({ error: "Notification ID is required" });
    }
    await deleteNotificationById(notificationId);
    res.status(204).send();
  } catch (err) {
    console.error("Error deleting notification:", err);
    res.status(500).json({ error: "Error deleting notification" });
  }
}