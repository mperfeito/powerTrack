import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import housesRoutes from "../routes/houses.route.js";
import { insertReadings } from "../controllers/consumptions.controller.js";
import "../jobs/notificationsJobs.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { validateFields } from "../middlewares/validateFields.js";
import userRoutes from "../routes/users.route.js";

dotenv.config();

const port = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(express.json());

app.post("api/login", validateFields(["email", "passowrd"], "any", login)); // POST api/login
app.use("api/users", userRoutes);

app.use(authMiddleware);

app.use("api/users/me/houses", housesRoutes);
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
