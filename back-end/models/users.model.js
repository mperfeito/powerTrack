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

export const getAllUsersWithHouses = async () => {
  try {
    const [results] = await db.execute(`
      SELECT 
        u.*,
        h.id_house AS house_id,
        h.address AS house_address,
        h.postal_code AS house_postal_code,
        h.city AS house_city,
        h.active AS house_active
      FROM users u
      LEFT JOIN houses h ON u.id_user = h.id_user
      ORDER BY u.id_user, h.id_house
    `);

    const usersMap = new Map();
    
    results.forEach(row => {
      if (!usersMap.has(row.id_user)) {
        const { house_id, house_address, house_postal_code, house_city, house_active, ...user } = row;
        usersMap.set(row.id_user, {
          ...user,
          houses: []
        });
      }
      
      if (row.house_id) {
        usersMap.get(row.id_user).houses.push({
          id_house: row.house_id,
          id_user: row.id_user,
          address: row.house_address,
          postal_code: row.house_postal_code,
          city: row.house_city,
          active: row.house_active
        });
      }
    });

    return Array.from(usersMap.values());
  } catch (err) {
    console.error("Error fetching users with houses:", err);
    throw err;
  }
}; 

export const deleteUserModel = async (id) => {
  try {
    const [result] = await db.execute("DELETE FROM users WHERE id_user = ?", [
      id,
    ]);
    return result.affectedRows > 0;
  } catch (err) {
    console.error("Error deleting user:", err);
    throw err;
  }
};
