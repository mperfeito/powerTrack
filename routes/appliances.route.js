import express from "express";
import * as appliancesController from "../controllers/appliances.controller.js";
const router = express.Router();

// test route: GET/appliances
router.get("/appliances", appliancesController.getAllAppliances);
// test route: GET/appliances/1
router.get("/appliances/:id_appliance", appliancesController.getApplianceById);
// test route: POST/appliances
router.post("/appliances", appliancesController.createAppliance);
// test route: DELETE/appliances/1
router.delete(
  "/appliances/:id_appliance",
  appliancesController.deleteAppliance
);

export default router;
