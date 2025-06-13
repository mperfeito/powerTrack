//GOALS.ROUTE.JS
import express from "express";
import * as controller from "../controllers/goals.controller.js"; 

const router = express.Router();

router.get("/", controller.getAllGoals); // GET /api/goals ☑️
                                        // GET /api/goals?includeProgress=true
                                        
router.get("/:id_goal", controller.getGoalById); // GEt /api/goals/{id} ☑️ 
router.patch("/:id_goal", controller.updateGoal); // PATCH /api/goals/{id} ☑️



router.post("/", controller.addGoal); // POST /api/goals ☑️
router.delete("/:id_goal", controller.deleteGoal); // DELETE /api/goals/{id} ☑️


export default router; 
