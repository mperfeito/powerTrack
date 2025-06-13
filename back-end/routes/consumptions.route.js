import express from "express";
import {
  latestReading,
  getPeriod,
  getDevices,
  getSimilarHouses,
  getConsumptionHistory
} from "../controllers/consumptions.controller.js";

const router = express.Router();

router.get("/latest", latestReading); // GET /api/consumptions/latest ☑️
router.get("/compare-period", getPeriod); // GET /api/consumptions/compare-period ☑️
router.get("/compare-similar", getSimilarHouses); // GET /api/consumptions/compare-similar ☑️
router.get("/compare-devices", getDevices); // GET /api/consumptions/compare-devices ☑️
router.get("/history", getConsumptionHistory); // GET /api/consumptions/history ☑️


export default router;