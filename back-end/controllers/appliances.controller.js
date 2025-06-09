import * as appliancesModel from "../models/appliances.model.js";
import { getActiveHouse } from "../models/houses.model.js";

const isPositiveNumber = (value) =>
  typeof value === "number" && value > 0 && Number.isFinite(value);

const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

export const getAllAppliances = async (req, res) => {
  try {
    console.log(`Recebida requisição: GET /api/appliances`);
    const { id_house } = await getActiveHouse(req.user.id_user);
    const appliances = await appliancesModel.getAppliancesByHouseId(id_house);

    if (!appliances || appliances.length === 0) {
      return res
        .status(404)
        .json({ message: "No appliances found for this house" });
    }

    res.status(200).json({ appliances });
  } catch (err) {
    console.error("Error fetching appliances:", err);
    return res.status(500).json({ errorMessage: "Internal server error" });
  }
};

export const getApplianceById = async (req, res) => {
  try {
    const { id_house } = await getActiveHouse(req.user.id_user);
    const { id_appliance } = req.params;

    if (!/^\d+$/.test(id_appliance)) {
      return res.status(400).json({ errorMessage: "Invalid appliance ID" });
    }

    const appliance = await appliancesModel.getApplianceById(
      id_house,
      id_appliance
    );

    if (!appliance) {
      return res.status(404).json({ errorMessage: "Appliance not found" });
    }

    res.status(200).json({ appliance });
  } catch (err) {
    console.error("Error fetching appliance:", err);
    return res.status(500).json({ errorMessage: "Internal server error" });
  }
};

export const createAppliance = async (req, res) => {
  try {
    const { id_house } = await getActiveHouse(req.user.id_user);
    const { type, state, avg_operating_hours, nominal_power_watts } = req.body;

    if (
      !isNonEmptyString(type) ||
      !isNonEmptyString(state) ||
      !isPositiveNumber(avg_operating_hours) ||
      !isPositiveNumber(nominal_power_watts)
    ) {
      return res.status(400).json({
        errorMessage:
          "Invalid or missing fields. Required: non-empty strings 'type' and 'state', positive numbers 'avg_operating_hours' and 'nominal_power_watts'.",
      });
    }

    const existingAppliance = await appliancesModel.getApplianceByType(
      id_house,
      type
    );

    if (existingAppliance) {
      return res.status(409).json({
        errorMessage: `Appliance of type '${type}' already exists in this house.`,
      });
    }

    const appliance = await appliancesModel.addAppliance(
      id_house,
      type,
      state,
      avg_operating_hours,
      nominal_power_watts
    );

    res.status(201).json({ message: "Resource successfully created", appliance });
  } catch (err) {
    console.error("Error creating appliance:", err);
    return res.status(500).json({ errorMessage: "Internal server error" });
  }
};

export const updateAppliance = async (req, res) => {
  try {
    const { id_house } = await getActiveHouse(req.user.id_user);
    const { id_appliance } = req.params;
    const updates = req.body;

    if (!/^\d+$/.test(id_appliance)) {
      return res.status(400).json({ errorMessage: "Invalid appliance ID" });
    }

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ errorMessage: "No fields provided for update" });
    }

    const allowedFields = [
      "type",
      "state",
      "avg_operating_hours",
      "nominal_power_watts",
    ];
    const invalidFields = Object.keys(updates).filter(
      (f) => !allowedFields.includes(f)
    );
    if (invalidFields.length > 0) {
      return res.status(400).json({
        errorMessage: `Invalid fields in update: ${invalidFields.join(", ")}`,
      });
    }

    if (
      ("type" in updates && !isNonEmptyString(updates.type)) ||
      ("state" in updates && !isNonEmptyString(updates.state)) ||
      ("avg_operating_hours" in updates &&
        !isPositiveNumber(Number(updates.avg_operating_hours))) ||
      ("nominal_power_watts" in updates &&
        !isPositiveNumber(Number(updates.nominal_power_watts)))
    ) {
      return res.status(400).json({
        errorMessage:
          "Invalid update values: 'type' and 'state' must be non-empty strings; 'avg_operating_hours' and 'nominal_power_watts' must be positive numbers.",
      });
    }

    const result = await appliancesModel.updateAppliance(
      id_house,
      id_appliance,
      updates
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ errorMessage: "Appliance not found" });
    }

    const updatedAppliance = await appliancesModel.getApplianceById(
      id_house,
      id_appliance
    );

    res
      .status(200)
      .json({ message: "Appliance updated successfully", appliance: updatedAppliance });
  } catch (err) {
    console.error("Error patching appliance:", err);
    return res.status(500).json({ errorMessage: "Internal server error" });
  }
};

export const deleteAppliance = async (req, res) => {
  console.log("ID recebido:", req.params.id_appliance);
  try {
    const { id_house } = await getActiveHouse(req.user.id_user);
    const { id_appliance } = req.params;

    if (!/^\d+$/.test(id_appliance)) {
      return res.status(400).json({ errorMessage: "Invalid appliance ID" });
    }

    const result = await appliancesModel.deleteAppliance(id_house, id_appliance);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        errorMessage: "The requested resource could not be found on the server",
      });
    }

    res.status(204).json({});
  } catch (err) {
    console.error("Error deleting appliance:", err);
    return res.status(500).json({ errorMessage: "Internal server error" });
  }
};
