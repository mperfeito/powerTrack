//HOUSES.CONTROLLER.JS
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  findByEmail,
  createUser,
  updateUser,
  getAllUsersWithHouses, 
  deleteUserModel
  
} from "../models/users.model.js";
import dotenv from "dotenv";

dotenv.config();

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPhoneNumber = (number) => /^\d{9}$/.test(number); 
const isValidNIF = (nif) => /^\d{9}$/.test(nif);

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


    if (!first_name || !last_name || !email || !phone_number || !nif || !password) {
      return res.status(400).json({ error: "All fields are required." });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Invalid email format." });
    }

    if (!isValidPhoneNumber(phone_number)) {
      return res.status(400).json({ error: "Invalid phone number format." });
    }

    if (!isValidNIF(nif)) {
      return res.status(400).json({ error: "Invalid NIF format." });
    }

    if (typeof is_admin !== "boolean") {
      return res.status(400).json({ error: "is_admin must be a boolean." });
    }

    const existUser = await findByEmail(email);
    if (existUser) {
      return res.status(400).json({ error: "Email already registered." });
    }

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

    const id = await createUser(newUser);
    res.status(201).json({ message: "User created successfully", id });
  } catch (err) {
    console.error("Registering error:", err);
    res.status(500).json({ error: "Error registering user..." });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Invalid email format." });
    }

    const existUser = await findByEmail(email);
    if (!existUser) {
      return res.status(400).json({ error: "Invalid credentials." });
    }

    const matchPassword = await bcrypt.compare(password, existUser.password);
    if (!matchPassword) {
      return res.status(400).json({ error: "Invalid credentials." });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: "JWT secret not defined in environment." });
    }

    const token = jwt.sign({ id: existUser.id_user }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Error when logging in." });
  }
};

export const getAuthUser = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized." });
  }

  const { password, ...user } = req.user;
  res.json(user);
};

export const updateAuthUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized." });
    }

    const allowedFields = ["first_name", "last_name", "email", "phone_number", "nif", "password"];
    const updates = Object.keys(req.body);
    const isValidUpdate = updates.every((field) => allowedFields.includes(field));

    if (!isValidUpdate) {
      return res.status(400).json({ error: "Invalid fields in request." });
    }

    let { password, email, phone_number, nif, ...otherFields } = req.body;

    if (email && !isValidEmail(email)) {
      return res.status(400).json({ error: "Invalid email format." });
    }

    if (phone_number && !isValidPhoneNumber(phone_number)) {
      return res.status(400).json({ error: "Invalid phone number format." });
    }

    if (nif && !isValidNIF(nif)) {
      return res.status(400).json({ error: "Invalid NIF format." });
    }

    const newPassword = password ? await bcrypt.hash(password, 10) : req.user.password;

    await updateUser(req.user.id_user, {
      ...otherFields,
      email,
      phone_number,
      nif,
      password: newPassword,
    });

    res.json({ message: "Updated data!" });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: "Error updating data..." });
  }
};

export const getAll = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (err) {
    console.error("Fetching users error:", err);
    res.status(500).json({ error: "Error fetching users" });
  }
}; 

export const getUsersAdmin = async (req, res) => {
  try {
    if (!req.user || !req.user.is_admin) {
      return res.status(403).json({ error: "Unauthorized - Admin access required" });
    }

    const usersWithHouses = await getAllUsersWithHouses();
    const sanitizedUsers = usersWithHouses.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    res.json(sanitizedUsers);
  } catch (err) {
    console.error("Error in getUsersAdmin:", err);
    res.status(500).json({ error: "Error fetching users with houses" });
  }
}; 

export const deleteUser = async (req, res) => {
  try {
    if (!req.user || !req.user.is_admin) {
      return res.status(403).json({ error: "Unauthorized - Admin access required" });
    }

    const userId = req.params.id;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const success = await deleteUserModel(userId); 
    if (!success) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: `User with ID ${userId} deleted successfully` });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: "Error deleting user" });
  }
};

