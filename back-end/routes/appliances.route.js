import express from "express";
import * as appliancesController from "../controllers/appliances.controller.js"; 
const router = express.Router();


router.get("/", appliancesController.getAllAppliances); // GET /api/appliances ☑️
router.get("/:id_appliance", appliancesController.getApplianceById); // GET /api/appliances/{id} ☑️
router.post("/", appliancesController.createAppliance); // POST /api/appliances ☑️
router.patch("/:id_appliance", appliancesController.updateAppliance); // PATCH /api/appliances/{id}☑️
router.delete(  "/:id_appliance", appliancesController.deleteAppliance // DELETE /api/appliances/{id} ☑️
);

export default router;
