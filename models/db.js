// db.js
import { Sequelize, DataTypes } from 'sequelize';
import dotenv from 'dotenv';

import UserModel from './users.model.js';
import HouseModel from './houses.model.js';
import GoalModel from './goals.model.js';
import ConsumptionReadingModel from './consumptions.model.js';
import ApplianceModel from './appliances.model.js';
// import NotificationModel from './notifications.model.js';

dotenv.config();

// Database connection properties
const sequelize = new Sequelize(
  process.env.DATABASE,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

// Test the connection to the DB & queries
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexão com Sequelize feita com sucesso!');
  } catch (error) {
    console.error('Erro ao conectar com o DB via Sequelize:', error);
  }
})();

// Inicialização dos modelos
const db = {}; //Object to be exported
db.sequelize = sequelize; //Save the sequelize instance

db.User = UserModel(sequelize, DataTypes);
db.House = HouseModel(sequelize, DataTypes);
db.Goal = GoalModel(sequelize, DataTypes);
db.ConsumptionReading = ConsumptionReadingModel(sequelize, DataTypes);
db.Appliance = ApplianceModel(sequelize, DataTypes);
db.Notification = NotificationModel(sequelize, DataTypes);

// Connections between tables
db.User.hasMany(db.House, { foreignKey: 'id_user' });
db.House.belongsTo(db.User, { foreignKey: 'id_user' });

db.House.hasMany(db.Goal, { foreignKey: 'id_house' });
db.Goal.belongsTo(db.House, { foreignKey: 'id_house' });

db.House.hasMany(db.ConsumptionReading, { foreignKey: 'id_house' });
db.ConsumptionReading.belongsTo(db.House, { foreignKey: 'id_house' });

db.House.hasMany(db.Appliance, { foreignKey: 'id_house' });
db.Appliance.belongsTo(db.House, { foreignKey: 'id_house' });

// db.House.hasMany(db.Notification, { foreignKey: 'id_house' });
// db.Notification.belongsTo(db.House, { foreignKey: 'id_house' });

export default db;