import express from "express";
import * as appliancesController from "../controllers/appliances.controller.js";
const router = express.Router();

// test route: GET/houses/1/appliances
router.get("/appliances", appliancesController.getAllAppliances);
// test route: GET/houses/1/appliances/1
router.get("/appliances/:id_appliance", appliancesController.getApplianceById);
// test route: POST/houses/1/appliances
router.post("/appliances", appliancesController.createAppliance);
// test route: DELETE/houses/1/appliances/1
router.delete(
  "/appliances/:id_appliance",
  appliancesController.deleteAppliance
);

export default router;
