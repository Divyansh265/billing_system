import { Request, Response } from "express";
import { pool } from "../config/db";

const getActivePlan = async (userId: number) => {
  const result = await pool.query(
    `SELECT p.* FROM Subscriptions s
    JOIN Plans p ON s.planId = p.id
    WHERE s.userId = $1 AND s.isActive = true`,
    [userId],
  );
  return result.rows[0];
};

const getMonthlyUsage = async (userId: number) => {
  const result = await pool.query(
    `SELECT COALESCE(SUM(usedUnits),0) AS total
    FROM UsageRecords
    WHERE userId=$1
    AND DATE_TRUNC('month', createdAt) = DATE_TRUNC('month', CURRENT_DATE)`,
    [userId],
  );
  return Number(result.rows[0].total);
};

export const recordUsage = async (req: Request, res: Response) => {
  try {
    const { userId, action, usedUnits } = req.body;

    if (!userId || !action || usedUnits === undefined) {
      return res.status(400).json({ 
        error: "userId, action, and usedUnits are required" 
      });
    }

    if (typeof usedUnits !== 'number' || usedUnits < 0) {
      return res.status(400).json({ 
        error: "usedUnits must be a non-negative number" 
      });
    }

    const result = await pool.query(
      "INSERT INTO UsageRecords (userId, action, usedUnits) VALUES ($1, $2, $3) RETURNING *",
      [userId, action, usedUnits],
    );

    res.json({
      message: "Usage recorded",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Error recording usage:", error);
    res.status(500).json({ error: "Failed to record usage" });
  }
};

export const getCurrentUsage = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);

    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const plan = await getActivePlan(userId);
    if (!plan) {
      return res.status(404).json({ error: "No active plan found" });
    }

    const totalUsed = await getMonthlyUsage(userId);
    const remaining = Math.max(Number(plan.monthlyquota) - totalUsed, 0);

    res.json({
      totalUsed,
      remainingUnits: remaining,
      activePlan: plan,
    });
  } catch (error) {
    console.error("Error getting current usage:", error);
    res.status(500).json({ error: "Failed to get current usage" });
  }
};

export const getBillingSummary = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.id);

    if (isNaN(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const plan = await getActivePlan(userId);
    if (!plan) {
      return res.status(404).json({ error: "No active plan found" });
    }

    const totalUsage = await getMonthlyUsage(userId);
    const quota = Number(plan.monthlyquota);
    let extraUnits = 0;
    let extraCharges = 0;

    if (totalUsage > quota) {
      extraUnits = totalUsage - quota;
      extraCharges = Number(
        (extraUnits * Number(plan.extrachargeperunit)).toFixed(2),
      );
    }

    res.json({
      totalUsage,
      planQuota: quota,
      extraUnits,
      extraCharges,
      activePlan: plan,
    });
  } catch (error) {
    console.error("Error getting billing summary:", error);
    res.status(500).json({ error: "Failed to get billing summary" });
  }
};
