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
      return res.status(400).json({ error: "Email already registered" });

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
    console.log('Login attempt for email:', email); // Add this
    console.log('Provided password:', password); // Add this

    const existUser = await findByEmail(email);
    console.log('User found in DB:', existUser); // Add this

    if (!existUser) {
      console.log('No user found with this email'); // Add this
      return res.status(400).json({ error: "Invalid credentials..." });
    }

    console.log('Stored hashed password:', existUser.password); // Add this
    const matchPassword = await bcrypt.compare(password, existUser.password);
    console.log('Password match result:', matchPassword); // Add this

    if (!matchPassword) {
      console.log('Password does not match'); // Add this
      return res.status(400).json({ error: "Invalid credentials..." });
    }

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
    let { password, ...otherFields } = req.body;

    password = password ? await bcrypt.hash(password, 10) : req.user.password;

    await updateUser(req.user.id_user, { ...otherFields, password });
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
  } catch {
    console.error("Fetching users error:", err);
    res.status(500).json({ error: "Error fetching users" });
  }
};
