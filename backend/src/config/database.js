/**
 * @file config/database.js
 * @description MongoDB connection with Mongoose, retry logic, and event listeners
 */

"use strict";

const mongoose = require("mongoose");
const logger   = require("../utils/logger");

const MONGO_OPTIONS = {
  autoIndex: process.env.NODE_ENV !== "production", // disable in prod for performance
};

let retries = 0;
const MAX_RETRIES = 5;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, MONGO_OPTIONS);
    retries = 0;
    logger.info(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    retries += 1;
    logger.error(`❌ MongoDB connection error (attempt ${retries}): ${error.message}`);

    if (retries >= MAX_RETRIES) {
      logger.error("Max retries reached. Exiting process.");
      process.exit(1);
    }

    // Exponential backoff
    const delay = Math.min(1000 * 2 ** retries, 30000);
    logger.warn(`Retrying in ${delay / 1000}s…`);
    setTimeout(connectDB, delay);
  }
};

// ── Mongoose Events ──────────────────────────────────────────────────────────
mongoose.connection.on("disconnected", () => logger.warn("MongoDB disconnected"));
mongoose.connection.on("reconnected",  () => logger.info("MongoDB reconnected"));
mongoose.connection.on("error",        (err) => logger.error(`MongoDB error: ${err.message}`));

module.exports = connectDB;
