import express from "express";
import { getAuthHouses, postAuthHouse, putAuthHouse, deleteAuthHouse } from "../controllers/houses.controller.js";
import { validateFields } from "../middlewares/validateFields.js";

const router = express.Router();


const houseFields = ['address', 'postal_code', 'city'];

// test route: GET/users/me/houses
router.get("/", getAuthHouses);
// test route: POST/users/me/houses
router.post("/", validateFields(houseFields, 'all'), postAuthHouse);
// test route: PUT/users/me/houses/1
router.put("/:id", validateFields(houseFields, 'any'), putAuthHouse);
// test route: DELETE/users/me/houses/1
router.delete("/:id", deleteAuthHouse);

export default router;
