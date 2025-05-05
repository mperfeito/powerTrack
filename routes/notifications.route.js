import express from "express";
import {
  notifyHighConsumption,
  notifyLowConsumption,
  notifyPeak,
} from "../controllers/notifications.controller.js";

const router = express.Router();

// test route: /sendNotifications/high/2?period=week
router.post("/high/:houseId", notifyHighConsumption);
// test route: /sendNotifications/low/2?period=month
router.post("/low/:houseId", notifyLowConsumption);
// test route:  /sendNotifications/peak/2
router.post("/peak/:houseId", notifyPeak);

export default router;
