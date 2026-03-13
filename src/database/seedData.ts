import { pool } from "../config/db";

export const seedData = async () => {
  try {
    const planCheck = await pool.query("SELECT COUNT(*) FROM Plans");
    if (Number(planCheck.rows[0]?.count) > 0) {
      console.log("Database already seeded");
      return;
    }

    await pool.query(`
      INSERT INTO Users (name) VALUES 
      ('Admin'),
      ('User')
      ON CONFLICT DO NOTHING
    `);

    await pool.query(`
      INSERT INTO Plans (name, monthlyQuota, extraChargePerUnit) VALUES 
      ('Basic', 100, 0.50),
      ('Premium', 500, 0.30),
      ('Enterprise', 2000, 0.20)
    `);

    await pool.query(`
      INSERT INTO Subscriptions (userId, planId, startDate, isActive) VALUES 
      (1, 1, CURRENT_DATE, true),
      (2, 2, CURRENT_DATE, true)
    `);

    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};
