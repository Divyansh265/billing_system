import { pool } from "../config/db";

export const initDB = async () => {
  try {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS Users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) 
        );
    `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS Plans(
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) ,
            monthlyQuota INT ,
            extraChargePerUnit DECIMAL(10,2) 
     ) `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS Subscriptions(
            id SERIAL PRIMARY KEY,
            userId INT REFERENCES Users(id) ,
           planId INT REFERENCES Plans(id) ,
            startDate Date,
            isActive BOOLEAN
        );
            `);
    await pool.query(`
        CREATE TABLE IF NOT EXISTS UsageRecords(
            id SERIAL PRIMARY KEY,
            userId INT REFERENCES Users(id) ,
          action VARCHAR(100) ,
            usedUnits INT ,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
            `);
    console.log("Database table created");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
};
