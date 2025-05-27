
import * as appliancesModel from "../models/appliances.model.js";
import { getActiveHouse } from "../models/houses.model.js";

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
    const appliance = await appliancesModel.getApplianceById(id_house, id_appliance);

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

    if (!type || !state || !avg_operating_hours || !nominal_power_watts) {
      return res.status(400).json({
        errorMessage:
          "All fields (type, state, avg_operating_hours, nominal_power_watts) are required",
      });
    }

  
    const existingAppliance = await appliancesModel.getApplianceByType(id_house, type);

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


export const deleteAppliance = async (req, res) => {
  try {
    const { id_house } = await getActiveHouse(req.user.id_user);
    const { id_appliance } = req.params;
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