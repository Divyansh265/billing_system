import { pool } from "../config/db";

export const initDB = async () => {
  try {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS Users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL
        );
    `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS Plans(
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            monthlyQuota INT NOT NULL,
            extraChargePerUnit DECIMAL(10,2) NOT NULL
        );
    `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS Subscriptions(
            id SERIAL PRIMARY KEY,
            userId INT NOT NULL REFERENCES Users(id),
            planId INT NOT NULL REFERENCES Plans(id),
            startDate DATE NOT NULL,
            isActive BOOLEAN NOT NULL DEFAULT true
        );
    `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS UsageRecords(
            id SERIAL PRIMARY KEY,
            userId INT NOT NULL REFERENCES Users(id),
            action VARCHAR(100) NOT NULL,
            usedUnits INT NOT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
    console.log("Database tables created successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
};
