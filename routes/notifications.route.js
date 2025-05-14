import express from "express";
import {
  getAuthNotifications,
  sendNotifications,
  deleteNotification,
} from "../controllers/notifications.controller.js";

const router = express.Router();

router.get("/notifications", getAuthNotifications); // GET /api/notifications
router.post("/sendNotifications", sendNotifications); // POST /api/sendNotifications
router.delete("/notifications/:id", deleteNotification); // DELTE /api/notifications/1

export default router;
