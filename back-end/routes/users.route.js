import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { validateFields } from "../middlewares/validateFields.js";
import {
  register,

  getAuthUser,
  updateAuthUser, 
  getUsersAdmin, 
  deleteUser
} from "../controllers/users.controller.js";
import { adminMiddleware } from "../middlewares/adminMiddleware.js";


const router = express.Router();

const registerFields = [
  "first_name",
  "last_name",
  "email",
  "phone_number",
  "nif",
  "password",
];

router.post("/", validateFields(registerFields, "all"), register); // POST api/users ☑️

router.get("/me", authMiddleware, getAuthUser); // GET api/users/me ☑️
router.patch(
  "/me",
  authMiddleware,
  validateFields(registerFields, "any"),
  updateAuthUser
); //PATCH api/users/me ☑️ 

router.get("/", authMiddleware, adminMiddleware, getUsersAdmin); // GET api/users ☑️  
router.delete("/:id",authMiddleware, adminMiddleware, deleteUser); // DELETE api/users/:id  


export default router;
