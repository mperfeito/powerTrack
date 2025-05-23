// NOTIFICATIONS.CONTROLLER.JS
import {
  checkConsumptionChanges,
  getPeakHourConsumption,
  createNotification,
  getNotifications,
  deleteNotificationById,
} from "../models/notifications.model.js";
import { getActiveHouse } from "../models/houses.model.js";
//J
import * as goalsModel from "../models/goals.model.js";
import { calculateGoalStatus } from "../controllers/goals.controller.js";

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
  console.log(req.user.id_user);

  try {
    const { id_house: houseId } = await getActiveHouse(req.user.id_user);
    console.log(houseId);
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
    const activeHouse = await getActiveHouse(req.user.id_user);
    if (!activeHouse || !activeHouse.id_house) {
      console.log("No active house found for the user.");
      return;
    }

    const result = await getPeakHourConsumption(activeHouse.id_house);

    if (result?.hour) {
      const message = `Peak consumption: ${result.value.toFixed(2)} watts at ${
        result.hour
      }:00 yesterday`;

      await createNotification(
        activeHouse.id_house,
        "peak_consumption",
        message
      );
    }
  } catch (error) {
    console.error("Error checking peak", error);
  }
}

export async function sendNotifications(req, res) {
  try {
    await checkHighConsumption();
    await checkLowConsumption();
    await checkPeakHours();
    //J
    await goalCompleted();
    res.status(200).json({ message: "Notifications sent successfully" });
  } catch (err) {
    console.error("Error sending notifications", err);
    res.status(500).json({ error: "Error sending notifications" });
  }
}
//J
export async function goalCompleted(req) {
  try {
    const { id_house } = await getActiveHouse(req.user.id_user);
    if (!id_house) {
      return res.status(404).json({
        success: false,
        message: "No active house found for the user.",
      });
    }

    const goals = await goalsModel.getGoalsByHouseId(id_house);

    if (!goals || goals.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No goals found for this house",
        notifications_sent: 0,
      });
    }

    let notificationsSent = 0;
    const results = [];

    for (const goal of goals) {
      const goalWithStatus = await calculateGoalStatus(id_house, goal);
      const previousStatus = await goalsModel.getGoalStatus(
        id_house,
        goal.id_goal
      );

      if (
        goalWithStatus.completed &&
        (!previousStatus || !previousStatus.completed)
      ) {
        const message = getCompletionMessage(goal);
        await createNotification(id_house, "goal_completed", message);
        await goalsModel.updateGoalStatus(id_house, goal.id_goal, true);
        notificationsSent++;

        results.push({
          goal_id: goal.id_goal,
          goal_type: goal.period_type,
          target_value: goal.target_value,
          message: message,
          notified: true,
        });
      } else {
        results.push({
          goal_id: goal.id_goal,
          goal_type: goal.period_type,
          target_value: goal.target_value,
          message: "Goal not completed or already notified",
          notified: false,
        });

        // Reset status if goal is no longer completed
        if (previousStatus?.completed && !goalWithStatus.completed) {
          await goalsModel.updateGoalStatus(id_house, goal.id_goal, false);
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: "Goal completion check completed",
      notifications_sent: notificationsSent,
      goals_checked: goals.length,
      details: results,
    });
  } catch (error) {
    console.error("Error checking goal completion", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error while checking goal completion",
    });
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

  return (
    messages[goal.period_type] || `Goal completed! Target was ${target}${unit}.`
  );
}
//-J

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
