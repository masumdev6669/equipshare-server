import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db";
import equipmentRoutes from "./routes/equipment";
import authRoutes from "./routes/auth";

const app = express();
const port = process.env.PORT || 8000;

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "EquipShare API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/equipment", equipmentRoutes);

connectDB().then(() => {
  app.listen(port, () => console.log(`Server running on port ${port}`));
});
