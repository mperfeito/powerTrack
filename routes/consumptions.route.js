import express from "express";
import {
  latestReading,
  getPeriod,
  getDevices,
  getSimilarHouses,
} from "../controllers/consumptions.controller.js";

const router = express.Router();



router.get("/latest", latestReading); // GET /api/consumptions/latest
router.get("/compare-period", getPeriod); // GET /api/consumptions/compare-period
router.get("/compare-similar", getSimilarHouses); // GET /api/consumptions/compare-similar
router.get("/compare-devices", getDevices); // GET /api/consumptions/compare-devices

// test route: GET/compare-goal
// router.get("/compare-goal", getGoalProgress)

export default router;
