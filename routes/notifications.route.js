import express from "express";
import {
  notifyHighConsumption,
  notifyLowConsumption,
  notifyPeak,
} from "../controllers/notifications.controller.js";

const router = express.Router();

// test route: /sendNotifications/high/2?period=week
router.post("/high", notifyHighConsumption);
// test route: /sendNotifications/low/2?period=month
router.post("/low", notifyLowConsumption);
// test route: /sendNotifications/peak
router.post("/peak", notifyPeak);

// test route: /sendNotifications/goal-done
// router.post("/goal-done", notifyGoal)

export default router;
