import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { findById } from "../models/users.model.js";

dotenv.config();

export async function authMiddleware(req, res, next) {

  const header = req.headers["x-access-token"] || req.headers.authorization;

  if (!header) {
    return res.status(401).json({ success: false, msg: "No token provided!" });
  }

 
  const token = header.startsWith("Bearer ") ? header.split(" ")[1] : header;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, msg: "User not found" });
    }


    req.loggedUserId = decoded.id;
    req.loggedUserRole = decoded.role;
    req.user = user;

    next();
  } catch (err) {
    console.error("authMiddleware error:", err);
    res.status(401).json({ success: false, msg: "Unauthorized!" });
  }
}
