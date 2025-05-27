// NOTIFICATIONS.CONTROLLER.JS
import cron from 'node-cron';
import {
  checkConsumptionChanges,
  getPeakHourConsumption,
  createNotification,
  getNotifications,
  deleteNotificationById,
} from "../models/notifications.model.js";
import { getActiveHouse, getAllActiveHouses } from "../models/houses.model.js";
import * as goalsModel from "../models/goals.model.js";
import { calculateGoalStatus } from "../controllers/goals.controller.js";


async function checkHighConsumptionForHouse(houseId) {
  try {
    const results = await checkConsumptionChanges(houseId);
    for (const [period, data] of Object.entries(results)) {
      if (data.percentage_change >= 10) {
        const message = `High ${period}ly consumption: Increased by ${data.percentage_change.toFixed(2)}%`;
        await createNotification(houseId, "high_consumption", message);
      }
    }
  } catch (error) {
    console.error(`Error checking high consumption for house ${houseId}:`, error);
  }
}

async function checkLowConsumptionForHouse(houseId) {
  try {
    const results = await checkConsumptionChanges(houseId);
    for (const [period, data] of Object.entries(results)) {
      if (data.percentage_change <= -10) {
        const message = `Low ${period}ly consumption: Decreased by ${Math.abs(data.percentage_change).toFixed(2)}%`;
        await createNotification(houseId, "low_consumption", message);
      }
    }
  } catch (error) {
    console.error(`Error checking low consumption for house ${houseId}:`, error);
  }
}

async function checkPeakHoursForHouse(houseId) {
  try {
    const result = await getPeakHourConsumption(houseId);
    if (result?.hour) {
      const message = `Peak consumption: ${result.value.toFixed(2)} watts at ${result.hour}:00 yesterday`;
      await createNotification(houseId, "peak_consumption", message);
    }
  } catch (error) {
    console.error(`Error checking peak hours for house ${houseId}:`, error);
  }
}

async function checkGoalsForHouse(houseId, userId) {
  try {
    const goals = await goalsModel.getGoalsByHouseId(houseId);
    for (const goal of goals) {
      const goalWithStatus = await calculateGoalStatus(houseId, goal);
      const previousStatus = await goalsModel.getGoalStatus(houseId, goal.id_goal);

      if (goalWithStatus.completed && (!previousStatus || !previousStatus.completed)) {
        const message = getCompletionMessage(goal);
        await createNotification(houseId, "goal_completed", message);
        await goalsModel.updateGoalStatus(houseId, goal.id_goal, true);
      } else if (previousStatus?.completed && !goalWithStatus.completed) {
        await goalsModel.updateGoalStatus(houseId, goal.id_goal, false);
      }
    }
  } catch (error) {
    console.error(`Error checking goals for house ${houseId}:`, error);
  }
}

// 2. Original Endpoint Handlers (maintained for backward compatibility)
export async function checkHighConsumption(req) {
  try {
    const { id_house: houseId } = await getActiveHouse(req.user.id_user);
    if (houseId) await checkHighConsumptionForHouse(houseId);
  } catch (error) {
    console.error("Error in checkHighConsumption:", error);
  }
}

export async function checkLowConsumption(req) {
  try {
    const { id_house: houseId } = await getActiveHouse(req.user.id_user);
    if (houseId) await checkLowConsumptionForHouse(houseId);
  } catch (error) {
    console.error("Error in checkLowConsumption:", error);
  }
}

export async function checkPeakHours(req) {
  try {
    const { id_house: houseId } = await getActiveHouse(req.user.id_user);
    if (houseId) await checkPeakHoursForHouse(houseId);
  } catch (error) {
    console.error("Error in checkPeakHours:", error);
  }
}

export async function goalCompleted(req, res) {
  try {
    const { id_house: houseId, id_user: userId } = await getActiveHouse(req.user.id_user);
    if (!houseId) {
      return res.status(404).json({ success: false, message: "No active house found" });
    }
    await checkGoalsForHouse(houseId, userId);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error in goalCompleted:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

// 3. Main Endpoint (unchanged)
export async function sendNotifications(req, res) {
  try {
    console.log("[Notification System] Starting notification process");
    const { id_house: houseId, id_user: userId } = await getActiveHouse(req.user.id_user);
    
    if (!houseId) {
      console.log("[Notification System] No active house found for user");
      return res.status(404).json({ error: "No active house found" });
    }
    
    console.log(`[Notification System] Processing house ${houseId} for user ${userId}`);
  
    
    // Log final com todas as notificações
    const allNotifications = await getNotifications(houseId);
    console.log(`[Notification System] Final notifications for house ${houseId}:`, allNotifications);
    
    res.status(200).json({ 
      message: "Notifications sent successfully",
      notifications: allNotifications 
    });
  } catch (err) {
    console.error("[Notification System Error]:", err);
    res.status(500).json({ error: "Error sending notifications" });
  }
}

// 4. Cron Job Scheduler
export function startNotificationScheduler() {
  //checks consumption changes
  cron.schedule('*/30 * * * *', async () => {
    console.log('Running hourly consumption checks...');
    try {
      const activeHouses = await getAllActiveHouses();
      for (const house of activeHouses) {
        await checkHighConsumptionForHouse(house.id_house);
        await checkLowConsumptionForHouse(house.id_house);
      }
    } catch (error) {
      console.error('Error in hourly consumption checks:', error);
    }
  });

  // peak hour 2 AM
  cron.schedule('0 2 * * *', async () => {
    console.log('Running daily peak hour checks...');
    try {
      const activeHouses = await getAllActiveHouses();
      for (const house of activeHouses) {
        await checkPeakHoursForHouse(house.id_house);
      }
    } catch (error) {
      console.error('Error in daily peak hour checks:', error);
    }
  });

  // midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily goal checks...');
    try {
      const activeHouses = await getAllActiveHouses();
      for (const house of activeHouses) {
        await checkGoalsForHouse(house.id_house, house.id_user);
      }
    } catch (error) {
      console.error('Error in daily goal checks:', error);
    }
  });

  console.log('Notification scheduler started');
}


export async function getAuthNotifications(req, res) {
  try {
    const { id_house: houseId } = await getActiveHouse(req.user.id_user);
    if (!houseId) {
      return res.status(404).json({ error: "No active house found" });
    }
    const notifications = await getNotifications(houseId);
    res.json(notifications);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ error: "Error fetching notifications" });
  }
}

export async function deleteNotification(req, res) {
  try {
    const notificationId = req.params.id;
    await deleteNotificationById(notificationId);
    res.status(204).send();
  } catch (err) {
    console.error("Error deleting notification:", err);
    res.status(500).json({ error: "Error deleting notification" });
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