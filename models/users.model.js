module.export = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    id_user: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {                
        isEmail: true              
    }
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nif: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
          len: [8, 100]
      }
    },
    is_admin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "users",
    timestamps: false,
  }
);


export const findByEmail = async (email) => {
  try {
    const user = await User.findOne({ where: { email } });
    return user ? user.get({ plain: true }) : null;
  } catch (err) {
    console.error("Error finding user by email:", err);
    throw err;
  }
};

export const findById = async (id) => {
  try {
    const user = await User.findByPk(id);
    return user ? user.get({ plain: true }) : null;
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
    const newUser = await User.create({
      first_name,
      last_name,
      email,
      phone_number,
      nif,
      password,
      is_admin,
    });

    console.log("User created with ID: ", newUser.id_user);
    return newUser.id_user;
  } catch (err) {
    console.error("Error creating user: ", err);
    throw err;
  }
};

export const updateUser = async (id, user) => {
  const { first_name, last_name, email, phone_number, password } = user;

  try {
    const [updatedRows] = await User.update(
      {
        first_name,
        last_name,
        email,
        phone_number,
        password,
      },
      { where: { id_user: id } }
    );

    return updatedRows > 0;
  } catch (err) {
    console.error("Error updating user:", err);
    throw err;
  }
};

export const getAllUsers = async () => {
  try {
    const users = await User.findAll();
    return users.map((u) => u.get({ plain: true }));
  } catch (err) {
    console.error("Error fetching all the users:", err);
    throw err;
  }
};
