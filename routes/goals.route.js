import express from "express";
import * as controller from "../controllers/goals.controller.js";

const router = express.Router();



router.get("/", controller.getAllGoals); // GET /api/goals
router.get("/:id_goal", controller.getGoalById); // GEt /api/goals/{id}
router.post("/", controller.addGoal); // POST /api/goals
router.delete("/:id_goal", controller.deleteGoal); // DELETE /api/goals/{id}

export default router;
