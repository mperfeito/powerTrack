import express from "express";
import { getAllConsumptions } from "../controllers/consumptions.controller.js";

const router = express.Router();

router.get("/latest", latestReading); // GET /api/consumptions/latest ☑️ 
router.get("/history", getConsumptionHistory); // GET /api/consumptions/history ☑️
router.get("/compare-period", getPeriod); // GET /api/consumptions/compare-period ☑️
router.get("/compare-similar", getSimilarHouses); // GET /api/consumptions/compare-similar ☑️
router.get("/compare-devices", getDevices); // GET /api/consumptions/compare-devices ☑️

router.get("/", getAllConsumptions);

/*
/api/consumptions?type=latest
/api/consumptions?type=period&period=month
/api/consumptions?type=similar
/api/consumptions?type=devices
/api/consumptions?type=history&limit=5
*/

export default router;
