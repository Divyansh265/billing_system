import express from "express";
import dotenv from "dotenv";
import usageRoutes from "./routes/usageRoutes";
import { initDB } from "./database/initDB";
dotenv.config();

const app = express();
app.use(express.json());
app.use("/", usageRoutes);

const PORT = process.env.PORT || 8000;
const startServer = async () => {
  await initDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};
startServer();
