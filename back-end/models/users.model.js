import db from "../config/connect.js";

export const findByEmail = async (email) => {
  try {
    const [result] = await db.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    return result[0] || null;
  } catch (err) {
    console.error("Error finding user by email:", err);
    throw err;
  }
};

export const findById = async (id) => {
  try {
    const [result] = await db.execute("SELECT * FROM users WHERE id_user = ?", [
      id,
    ]);
    return result[0] || null;
  } catch (err) {
    console.error("Error finding user by id:", err);
    throw err;
  }
};

export const createUser = async (user) => {
  const {
    first_name,
    last_name,
    email,
    phone_number,
    nif,
    password,
    is_admin = false,
  } = user;

  console.log("Creating user with: ", user);

  try {
    const [result] = await db.execute(
      "INSERT INTO users (first_name, last_name, email, phone_number, nif, password, is_admin) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [first_name, last_name, email, phone_number, nif, password, is_admin]
    );
    console.log("User created with ID: ", result.insertId);
    return result.insertId;
  } catch (err) {
    console.error("Error creating user: ", err);
    throw err;
  }
};
export const updateUser = async (id, user) => {
  const { first_name, last_name, email, phone_number, password } = user;

  try {
    const [result] = await db.execute(
      `UPDATE users SET 
        first_name = ?, 
        last_name = ?, 
        email = ?, 
        phone_number = ?, 
        password = ?
      WHERE id_user = ?`,
      [first_name, last_name, email, phone_number, password, id]
    );
    return result.affectedRows > 0;
  } catch (err) {
    console.error("Error updating user:", err);
    throw err;
  }
};

export const getAllUsers = async () => {
  try {
    const [result] = await db.execute("SELECT * FROM users");
    return result;
  } catch (err) {
    console.error("Error fetching all the users:", err);
    throw err;
  }
};
