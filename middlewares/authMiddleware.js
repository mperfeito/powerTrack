import jwt from "jsonwebtoken";
import { findById } from "../models/users.model.js";
import dotenv from "dotenv";

dotenv.config();

export async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return res.sendStatus(401);

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await findById(decoded.id);

    if (!user) return res.sendStatus(401);

    req.user = user;
    next();
  } catch (err) {
    console.error("authMiddleware error:", err);
    res.sendStatus(403);
  }
}
