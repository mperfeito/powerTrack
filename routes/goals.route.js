import express from "express";
import * as controller from "../controllers/goals.controller.js";

const router = express.Router();

// test route: GET/goals
router.get("/goals", controller.getAllGoals);
// test route: GET/goals/1
router.get("/goals/:id_goal", controller.getGoalById);
// test route: POST/goals
router.post("/goals", controller.addGoal);
// test route: DELETE/goals/1
router.delete("/goals/:id_goal", controller.deleteGoal);

export default router;
