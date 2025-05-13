import express from "express";
import {
  latestReading,
  getPeriod,
  getDevices,
  getSimilarHouses,
} from "../controllers/consumptions.controller.js";

const router = express.Router();

// test route: GET/latest
router.get("/latest", latestReading);
// test route: GET/compare-period?period=week
router.get("/compare-period", getPeriod);
// test route: GET/compare-similar
router.get("/compare-similar", getSimilarHouses);
// test route: GET/houses/1/compare-devices
router.get("/compare-devices", getDevices);

// test route: GET/compare-goal
// router.get("/compare-goal", getGoalProgress)

export default router;
