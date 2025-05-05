import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { validateFields } from "../middlewares/validateFields.js";
import {
  register,
  login,
  getAuthUser,
  updateAuthUser,
  getAll,
} from "../controllers/users.controller.js";
import housesRoutes from "./houses.route.js";

const router = express.Router();

function adminMiddleware(req, res, next) {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({ error: "Access denied..." });
  }
  next();
}

const registerFields = [
  "first_name",
  "last_name",
  "email",
  "phone_number",
  "nif",
  "password",
];
const loginFields = ["email", "password"];

router.post("/", validateFields(registerFields, "all"), register);
router.post("/login", validateFields(loginFields, "any"), login);

router.use("/me/houses", authMiddleware, housesRoutes);
router.get("/me", authMiddleware, getAuthUser);
router.patch(
  "/me",
  authMiddleware,
  validateFields(registerFields, 'any'),
  updateAuthUser
);

router.get("/", adminMiddleware, getAll);

export default router;
