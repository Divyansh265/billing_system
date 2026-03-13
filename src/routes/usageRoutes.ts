import express from "express";
import {
  createUser,
  getBillingSummary,
  getCurrentUsage,
  recordUsage,
} from "../controllers/usageController";

const router = express.Router();

router.post("/usage", recordUsage);
router.post("/users", createUser);
router.get("/users/:id/current-usage", getCurrentUsage);
router.get("/users/:id/billing-summary", getBillingSummary);

export default router;
