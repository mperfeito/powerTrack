import express from "express";
import {
  latestReading,
  getPeriod,
  getDevices,
  getSimilarHouses,
} from "../controllers/consumptions.controller.js";

const router = express.Router();

// test route: GET/houses/1/latest
router.get("/latest", latestReading);
// test route: GET/houses/1/compare-period?period=week
router.get("/compare-period", getPeriod);
// test route: GET/houses/1/compare-similar
router.get("/compare-similar", getSimilarHouses);
//teste route: GET/houses/1/compare-devices
router.get("/compare-devices", getDevices);

export default router;
