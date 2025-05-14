import * as appliancesModel from "../models/appliances.model.js";
import { getActiveHouse } from "../models/houses.model.js";

export const getAllAppliances = async (req, res) => {
  const { id_house } = await getActiveHouse(req.user.id_user);

  appliancesModel.getAppliancesByHouseId(id_house, (err, appliances) => {
    if (err) {
      console.error("Error fetching appliances:", err);
      return res.status(500).json({ errorMessage: "Internal server error" });
    }

    if (!appliances || appliances.length === 0) {
      return res
        .status(404)
        .json({ message: "No appliances found for this house" });
    }

    res.status(200).json({ appliances });
  });
};

export const getApplianceById = async (req, res) => {
  const { id_house } = await getActiveHouse(req.user.id_user);
  const { id_appliance } = req.params;

  appliancesModel.getApplianceById(id_house, id_appliance, (err, appliance) => {
    if (err) {
      console.error("Error fetching appliance:", err);
      return res.status(500).json({ errorMessage: "Internal server error" });
    }

    if (!appliance) {
      return res.status(404).json({ errorMessage: "Appliance not found" });
    }

    res.status(200).json({ appliance });
  });
};

// Create a new appliance for a specific house
export const createAppliance = async (req, res) => {
  const { id_house } = await getActiveHouse(req.user.id_user);
  const { type, state, avg_operating_hours, nominal_power_watts } = req.body;

  // Validate the request body parameters
  if (!type || !state || !avg_operating_hours || !nominal_power_watts) {
    return res.status(400).json({
      errorMessage:
        "All fields (type, state, avg_operating_hours, nominal_power_watts) are required",
    });
  }

  appliancesModel.addAppliance(
    id_house,
    type,
    state,
    avg_operating_hours,
    nominal_power_watts,
    (err, appliance) => {
      if (err) {
        console.error("Error creating appliance:", err);
        return res.status(500).json({ errorMessage: "Internal server error" });
      }

     
      res
        .status(201)
        .json({ message: "Resource successfully created", appliance });
    }
  );
};

// Delete an appliance by ID
export const deleteAppliance = (req, res) => {
  const { id_house } = getActiveHouse(req.user.id_user);
  const { id_appliance } = req.params;

  appliancesModel.deleteAppliance(id_house, id_appliance, (err, result) => {
    if (err) {
      console.error("Error deleting appliance:", err);
      return res.status(500).json({ errorMessage: "Internal server error" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        errorMessage: "The requested resource could not be found on the server",
      });
    }

    res.status(204).json({});
  });
};
