import * as goalsModel from "../models/goals.model.js";
import { getActiveHouse } from "../models/houses.model.js";

export const calculateGoalStatus = async (id_house, goal) => {
  try {
    if (goal.period_type === "daily") {
      const today = new Date().toISOString().slice(0, 10);
      const total = await goalsModel.getTotalConsumptionByDay(id_house, today);
      const completed = (total || 0) <= goal.target_value;
      return { ...goal, completed };
    }

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
      const previousMonthEnd = new Date(
        today.getFullYear(),
        today.getMonth(),
        0
      );

      const currentConsumption = await goalsModel.getTotalConsumptionByPeriod(
        id_house,
        currentMonthStart.toISOString().slice(0, 10),
        currentMonthEnd.toISOString().slice(0, 10)
      );

      const referenceConsumption = await goalsModel.getTotalConsumptionByPeriod(
        id_house,
        previousMonthStart.toISOString().slice(0, 10),
        previousMonthEnd.toISOString().slice(0, 10)
      );

      const allowedLimit = referenceConsumption * (1 - reductionPercentage);
      const completed = currentConsumption <= allowedLimit;
      return { ...goal, completed };
    }

    if (goal.period_type === "weekly_reduction") {
      const reductionPercentage = goal.target_value / 100;
      const today = new Date();

      const currentWeekStart = new Date(today);
      currentWeekStart.setDate(today.getDate() - today.getDay());
      const currentWeekEnd = new Date(currentWeekStart);
      currentWeekEnd.setDate(currentWeekStart.getDate() + 6);

      const previousWeekStart = new Date(currentWeekStart);
      previousWeekStart.setDate(previousWeekStart.getDate() - 7);
      const previousWeekEnd = new Date(currentWeekEnd);
      previousWeekEnd.setDate(previousWeekEnd.getDate() - 7);

      const currentConsumption = await goalsModel.getTotalConsumptionByPeriod(
        id_house,
        currentWeekStart.toISOString().slice(0, 10),
        currentWeekEnd.toISOString().slice(0, 10)
      );

      const referenceConsumption = await goalsModel.getTotalConsumptionByPeriod(
        id_house,
        previousWeekStart.toISOString().slice(0, 10),
        previousWeekEnd.toISOString().slice(0, 10)
      );

      const allowedLimit = referenceConsumption * (1 - reductionPercentage);
      const completed = currentConsumption <= allowedLimit;
      return { ...goal, completed };
    }

    if (goal.period_type === "monthly") {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      const total = await goalsModel.getTotalConsumptionByPeriod(
        id_house,
        startOfMonth.toISOString().slice(0, 10),
        endOfMonth.toISOString().slice(0, 10)
      );

      const completed = total <= goal.target_value;
      return { ...goal, completed };
    }

    if (goal.period_type === "peak_hour") {
      const today = new Date().toISOString().slice(0, 10);
      const total = await goalsModel.getTotalConsumptionByDay(id_house, today);

      const peakHourStart = `${today}T18:00:00`;
      const peakHourEnd = `${today}T21:00:00`;

      const peakConsumption =
        await goalsModel.getTotalConsumptionByDateTimeRange(
          id_house,
          peakHourStart,
          peakHourEnd
        );

      const allowedPeakConsumption = total * (goal.target_value / 100);
      const completed = peakConsumption <= allowedPeakConsumption;
      return { ...goal, completed };
    }

    return { ...goal, completed: false };
  } catch (err) {
    console.error(`Error calculating ${goal.period_type} goal status:`, err);
    return { ...goal, completed: false };
  }
};

// export const getAllGoals = async (req, res) => {
//   try {
//     const { id_house: houseId } = await getActiveHouse(req.user.id_user);
//     console.log(`Fetching goals for house ${houseId}`); // Debug

//     const goals = await goalsModel.getGoalsByHouseId(houseId);
//     console.log('Goals from DB:', goals); // Debug

//     if (!goals || goals.length === 0) {
//       return res.status(404).json({
//         message: "No goals found for this house",
//         houseId
//       });
//     }

//     const goalsWithStatus = await Promise.all(
//       goals.map(goal => calculateGoalStatus(houseId, goal))
//     );

//     res.status(200).json({ goals: goalsWithStatus });
//   } catch (error) {
//     console.error("Error in getAllGoals:", error);
//     res.status(500).json({
//       message: "Internal server error",
//       error: error.message
//     });
//   }
// };

// Obter todas as metas da casa ativa
export const getGoals = async (req, res) => {
  try {
    // Assuming you have a way to get the active house ID
    const { id_house: houseId } = await getActiveHouse(req.user.id_user);

    console.log(`Fetching goals for house ${houseId}`);
    getGoalsByHouseId(houseId, (err, goals) => {
      if (err) {
        console.error("Error fetching goals:", err);
        return res.status(500).json({ error: "Failed to fetch goals" });
      }
      console.log("Goals from DB:", goals);
      res.json(goals);
    });
  } catch (error) {
    console.error("Error in goals route:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const getGoalById = async (req, res) => {
  try {
    const { id_house: houseId } = await getActiveHouse(req.user.id_user);
    const { id_goal } = req.params;

    const goal = await goalsModel.getGoalById(houseId, id_goal);

    if (!goal) {
      return res.status(404).json({ message: "Goal not found for this house" });
    }

    const goalWithStatus = await calculateGoalStatus(houseId, goal);
    res.status(200).json({ goal: goalWithStatus });
  } catch (error) {
    console.error("Error in getGoalById:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const addGoal = async (req, res) => {
  try {
    const { id_house: houseId } = await getActiveHouse(req.user.id_user);
    console.log("Creating goal for house:", houseId); // Adicione este log

    const { period_type, target_value, start_date, end_date } = req.body;

    const newGoal = {
      id_house: houseId,
      period_type,
      target_value,
      start_date: start_date || null,
      end_date: end_date || null,
    };

    const insertedGoal = await goalsModel.createGoal(newGoal);
    res.status(201).json({
      message: "Goal successfully created",
      goal: insertedGoal,
      houseId: houseId, // Adicione esta linha para debug
    });
  } catch (error) {
    console.error("Error in addGoal:", error);
    res.status(500).json({
      errorMessage: "Failed to create goal",
      errorDetails: error.message,
    });
  }
};

export const deleteGoal = async (req, res) => {
  try {
    const { id_house: houseId } = await getActiveHouse(req.user.id_user);
    const { id_goal } = req.params;

    const result = await goalsModel.deleteGoal(houseId, id_goal);

    if (result.affectedRows > 0) {
      return res.status(204).end();
    } else {
      return res.status(404).json({ errorMessage: "Goal not found to delete" });
    }
  } catch (error) {
    console.error("Error in deleteGoal:", error);
    res.status(500).json({ errorMessage: "Failed to process request" });
  }
};

// Teste temporário - adicione no controller
export const testDirectQuery = async (req, res) => {
  try {
    const directResults = await new Promise((resolve, reject) => {
      db.query("SELECT * FROM goals WHERE id_house = 13", (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    res.json({ directResults });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
