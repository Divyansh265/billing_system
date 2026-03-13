import express from "express";
import {
  getBillingSummary,
  getCurrentUsage,
  recordUsage,
} from "../controllers/usageController";

const router = express.Router();

router.post("/usage", recordUsage);
router.get("/users/:id/current-usage", getCurrentUsage);
router.get("/users/:id/billing-summary", getBillingSummary);

export default router;
