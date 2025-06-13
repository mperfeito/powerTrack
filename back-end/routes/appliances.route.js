import express from "express";
import * as appliancesController from "../controllers/appliances.controller.js"; 
import { validateFields } from "../middlewares/validateFields.js";

const router = express.Router();

const applianceFields = ["type", "state", "avg_operating_hours", "nominal_power_watts" ];

router.get("/", appliancesController.getAllAppliances); // GET /api/appliances ☑️
router.get("/:id_appliance",  appliancesController.getApplianceById); // GET /api/appliances/{id} ☑️
router.post("/",validateFields(applianceFields, 'all'), appliancesController.createAppliance); // POST /api/appliances ☑️
router.patch("/:id_appliance", validateFields(applianceFields, 'any'), appliancesController.updateAppliance); // PATCH /api/appliances/{id}☑️
router.delete(  "/:id_appliance", appliancesController.deleteAppliance // DELETE /api/appliances/{id} ☑️
);

export default router;