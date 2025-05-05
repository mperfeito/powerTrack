import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "../routes/users.route.js";
import notificationsRoutes from "../routes/notifications.route.js";
import consumptionsRoutes from "../routes/consumptions.route.js";
import goalsRoutes from "../routes/goals.route.js";
import appliancesRoutes from "../routes/appliances.route.js";
import { insertReadings } from "../controllers/consumptions.controller.js";

dotenv.config();

const port = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(express.json());


app.use("/users", userRoutes);
app.use("/houses/:idHouse", consumptionsRoutes, goalsRoutes, appliancesRoutes );
app.use('/sendNotifications', notificationsRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Resource not found" });
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ error: err.message });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  insertReadings();
});
