import * as goalsModel from "../models/goals.model.js";
import { getActiveHouse } from "../models/houses.model.js";

export const calculateGoalStatus = async (id_house, goal) => {
  if (goal.period_type === "daily") {
    const today = new Date().toISOString().slice(0, 10);
    try {
      const total = await new Promise((resolve, reject) => {
        goalsModel.getTotalConsumptionByDay(id_house, today, (err, total) => {
          if (err) reject("Error calculating daily consumption");
          resolve(total);
        });
      });

      const completed = (total || 0) <= goal.target_value;
      return { ...goal, completed };
    } catch (err) {
      console.error("Error calculating daily goal:", err);
      return { ...goal, completed: false };
    }
  }

  // When goal is 'monthly_reduction'
  if (goal.period_type === "monthly_reduction") {
    const reductionPercentage = goal.target_value / 100;

    const today = new Date();
    const currentMonthStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );
    const currentMonthEnd = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    );
    const previousMonthStart = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1
    );
    const previousMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    try {
      const currentConsumption = await new Promise((resolve, reject) => {
        goalsModel.getTotalConsumptionByPeriod(
          id_house,
          currentMonthStart.toISOString().slice(0, 10),
          currentMonthEnd.toISOString().slice(0, 10),
          (err, total) => {
            if (err) reject(err);
            resolve(total || 0);
          }
        );
      });

      const referenceConsumption = await new Promise((resolve, reject) => {
        goalsModel.getTotalConsumptionByPeriod(
          id_house,
          previousMonthStart.toISOString().slice(0, 10),
          previousMonthEnd.toISOString().slice(0, 10),
          (err, total) => {
            if (err) reject(err);
            resolve(total || 0);
          }
        );
      });

      const allowedLimit = referenceConsumption * (1 - reductionPercentage);
      const completed = currentConsumption <= allowedLimit;

      return { ...goal, completed };
    } catch (err) {
      console.error("Error calculating reduction goal:", err);
      return { ...goal, completed: false };
    }
  }

  // When goal is 'weekly_reduction'
  if (goal.period_type === "weekly_reduction") {
    const reductionPercentage = goal.target_value / 100;

    const today = new Date();
    const currentWeekStart = new Date(today);
    currentWeekStart.setDate(today.getDate() - today.getDay()); // First day of the week
    const currentWeekEnd = new Date(currentWeekStart);
    currentWeekEnd.setDate(currentWeekStart.getDate() + 6); // Last day of the week

    // Adjust for the previous week's calculation
    const previousWeekStart = new Date(currentWeekStart);
    previousWeekStart.setDate(previousWeekStart.getDate() - 7); // Start of the previous week
    const previousWeekEnd = new Date(currentWeekEnd);
    previousWeekEnd.setDate(previousWeekEnd.getDate() - 7); // End of the previous week

    try {
      const currentConsumption = await new Promise((resolve, reject) => {
        goalsModel.getTotalConsumptionByPeriod(
          id_house,
          currentWeekStart.toISOString().slice(0, 10),
          currentWeekEnd.toISOString().slice(0, 10),
          (err, total) => {
            if (err) reject(err);
            resolve(total || 0); // Ensure that if no consumption, return 0
          }
        );
      });

      const referenceConsumption = await new Promise((resolve, reject) => {
        goalsModel.getTotalConsumptionByPeriod(
          id_house,
          previousWeekStart.toISOString().slice(0, 10),
          previousWeekEnd.toISOString().slice(0, 10),
          (err, total) => {
            if (err) reject(err);
            resolve(total || 0); // Ensure that if no consumption, return 0
          }
        );
      });

      // Calculate the allowed limit (80% of the previous week's consumption)
      const allowedLimit = referenceConsumption * (1 - reductionPercentage);

      // Check if the goal was completed
      const completed = currentConsumption <= allowedLimit;

      return { ...goal, completed };
    } catch (err) {
      console.error("Error calculating weekly reduction:", err);
      return { ...goal, completed: false };
    }
  }

  // When goal is 'monthly'
  if (goal.period_type === "monthly") {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    try {
      const total = await new Promise((resolve, reject) => {
        goalsModel.getTotalConsumptionByPeriod(
          id_house,
          startOfMonth.toISOString().slice(0, 10),
          endOfMonth.toISOString().slice(0, 10),
          (err, total) => {
            if (err) reject(err);
            resolve(total || 0);
          }
        );
      });

      const completed = total <= goal.target_value;
      return { ...goal, completed };
    } catch (err) {
      console.error("Error calculating monthly goal:", err);
      return { ...goal, completed: false };
    }
  }

  // When goal is 'peak_hour'
  if (goal.period_type === "peak_hour") {
    const today = new Date().toISOString().slice(0, 10);

    try {
      // Total Consumption of the day
      const total = await new Promise((resolve, reject) => {
        goalsModel.getTotalConsumptionByDay(id_house, today, (err, total) => {
          if (err) reject("Error calculating daily consumption");
          resolve(total);
        });
      });

      // Peak Hour (for now - 18h to 21h)
      const peakHourStart = today + "T18:00:00";
      const peakHourEnd = today + "T21:00:00";

      const peakConsumption = await new Promise((resolve, reject) => {
        goalsModel.getTotalConsumptionByDateTimeRange(
          id_house,
          peakHourStart,
          peakHourEnd,
          (err, total) => {
            if (err) reject("Error calculating peak hour consumption");
            resolve(total);
          }
        );
      });
      // If the consumption is superior to  the percentage in target_value
      const allowedPeakConsumption = total * (goal.target_value / 100);
      const completed = peakConsumption <= allowedPeakConsumption;

      return { ...goal, completed };
    } catch (err) {
      console.error("Error calculating peak hour goal:", err);
      return { ...goal, completed: false };
    }
  }

  return { ...goal, completed: false };
};

// Get all goals from a house
export const getAllGoals = async (req, res) => {
  const { id_house } = getActiveHouse(req.user.id);

  try {
    const goals = await new Promise((resolve, reject) => {
      goalsModel.getGoalsByHouseId(id_house, (err, goals) => {
        if (err) reject("Error fetching goals");
        resolve(goals);
      });
    });

    if (!Array.isArray(goals) || goals.length === 0) {
      return res.status(404).json({ message: "No goals found for this house" });
    }

    const goalsWithStatus = await Promise.all(
      goals.map((goal) => calculateGoalStatus(id_house, goal))
    );
    res.status(200).json({ goals: goalsWithStatus });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

// Get a specific goal by ID
export const getGoalById = async (req, res) => {
  const { id_house } = getActiveHouse(req.user.id);
  const { id_goal } = req.params;

  try {
    const goal = await new Promise((resolve, reject) => {
      goalsModel.getGoalById(id_house, id_goal, (err, goal) => {
        if (err) reject("Error fetching goal");
        resolve(goal);
      });
    });

    if (!goal) {
      return res.status(404).json({ message: "Goal not found for this house" });
    }

    const goalWithStatus = await calculateGoalStatus(id_house, goal);
    res.status(200).json({ goal: goalWithStatus });
  } catch (error) {
    return res.status(500).json({ message: error });
  }
};

// Add a new goal
export const addGoal = async (req, res) => {
  const { id_house } = getActiveHouse(req.user.id);
  const { period_type, target_value, start_date, end_date } = req.body;

  if (!period_type || !target_value) {
    return res
      .status(400)
      .json({ errorMessage: "Period type and target value are required" });
  }
  const newGoal = {
    id_house,
    period_type,
    target_value,
    start_date: start_date || null,
    end_date: end_date || null,
  };
  try {
    const insertedGoal = await new Promise((resolve, reject) => {
      goalsModel.createGoal(newGoal, (err, goal) => {
        if (err) {
          console.error("Error adding goal:", err);
          reject("Error adding goal");
        }
        resolve(goal);
      });
    });

    res
      .status(201)
      .json({ message: "Resource successfully created", goal: insertedGoal });
  } catch (error) {
    console.error("Error creating goal:", error);
    res.status(500).json({ errorMessage: "Failed to create goal" });
  }
};

// Delete a goal
export const deleteGoal = (req, res) => {
  const { id_house } = getActiveHouse(req.user.id);
  const { id_goal } = req.params;

  goalsModel.deleteGoal(id_house, id_goal, (err, result) => {
    if (err) {
      console.error(err);
      return res
        .status(500)
        .json({ errorMessage: "Failed to process request" });
    }

    if (result.affectedRows > 0) {
      return res.status(204).json();
    } else {
      return res.status(404).json({ errorMessage: "Goal not found to delete" });
    }
  });
};
