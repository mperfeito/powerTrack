//HOUSES.ROUTE.JS
import express from "express";
import {
  getAuthHouses,
  postAuthHouse,
  putAuthHouse,
  deleteAuthHouse,
  getAuthActiveHouse,
  setAuthActiveHouse,
} from "../controllers/houses.controller.js";
import { validateFields } from "../middlewares/validateFields.js";

const router = express.Router();

const houseFields = ["address", "postal_code", "city"];


router.get("/", getAuthHouses); // GET /api/users/me/houses ☑️
router.post("/", validateFields(houseFields, "all"), postAuthHouse); // POST /api/users/me/houses ☑️
router.patch("/:id", validateFields(houseFields, "any"), putAuthHouse); // PATCH /api/users/me/houses/{id} ☑️
router.get("/active", getAuthActiveHouse); // GET /api/users/me/houses/active ☑️
router.patch("/active/:id", setAuthActiveHouse); // PAtch /api/users/me/houses/active/{id} ☑️
router.delete("/:id", deleteAuthHouse); // DELETE /api/users/me/houses/{id} ☑️ 


export default router;
