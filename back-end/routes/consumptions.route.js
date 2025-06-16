import express from "express";
import { getAllConsumptions } from "../controllers/consumptions.controller.js";

const router = express.Router();

router.get("/", getAllConsumptions);

/*
/api/consumptions?type=latest
/api/consumptions?type=period&period=month
/api/consumptions?type=similar
/api/consumptions?type=devices
/api/consumptions?type=history&limit=5
*/

export default router;
