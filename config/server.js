import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "../routes/users.route.js";
import housesRoutes from "../routes/houses.route.js";
import appliancesRoutes from "../routes/appliances.route.js";
import goalsRoutes from "../routes/goals.route.js";
import consumptionsRoutes from "../routes/consumptions.route.js";
import notificationsRoutes from "../routes/notifications.route.js";
import { insertReadings } from "../controllers/consumptions.controller.js";
import "../cron-jobs/notificationsJobs.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { validateFields } from "../middlewares/validateFields.js";
import { login } from "../controllers/users.controller.js";

dotenv.config();

const port = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(express.json());

app.post("/api/login", login); // POST api/login ☑️
app.use("/api/users", userRoutes);

app.use(authMiddleware);

app.use("/api/users/me/houses", housesRoutes);
app.use("/api/appliances", appliancesRoutes);
app.use("/api/goals", goalsRoutes);
app.use("/api/consumptions", consumptionsRoutes);
app.use("/api", notificationsRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Resource not found" });

});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({ error: err.message || "Server error" });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  insertReadings().catch((err) => {
    console.error("Failed to initialize readings:", err);
  });
});
