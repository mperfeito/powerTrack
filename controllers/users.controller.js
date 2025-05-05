import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  findByEmail,
  createUser,
  updateUser,
  getAllUsers,
} from "../models/users.model.js";
import dotenv from "dotenv";

dotenv.config();

export const register = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      phone_number,
      nif,
      password,
      is_admin = false,
    } = req.body;

    const existUser = await findByEmail(email);
    if (existUser)
      return res.status(400).json({ error: "Email already registed" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      first_name,
      last_name,
      email,
      phone_number,
      nif,
      password: hashedPassword,
      is_admin,
    };
    
    const result = await createUser(newUser);
    res.status(201).json({ message: "User created successfully", id: result });
  } catch (err) {
    console.error("Registing error:", err);
    res.status(500).json({ error: "Error registering user..." });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;


    const existUser = await findByEmail(email);
    if (!existUser)
      return res.status(400).json({ error: "Invalid credentials..." });

    const matchPassword = await bcrypt.compare(password, existUser.password);
    if (!matchPassword)
      return res.status(400).json({ error: "Invalid credentials..." });

    const token = jwt.sign({ id: existUser.id_user }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Error when logging in" });
  }
};

export const getAuthUser = (req, res) => {
  const { password, ...user } = req.user;
  res.json(user);
};

export const updateAuthUser = async (req, res) => {
  try {
    await updateUser(req.user.id_user, req.body);
    res.json({ message: "Updated data !" });
  } catch {
    res.status(500).json({ error: "Error updating data..." });
  }
};

export const getAll = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch {
    res.status(500).json({ error: "Error fetching users" });
  }
};
