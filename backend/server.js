/**
 * @file server.js
 * @description Application entry point — boots HTTP server, Socket.IO, DB connection, and cron jobs
 */

"use strict";

require("dotenv").config();
const http = require("http");
const app = require("./src/app");
const connectDB = require("./src/config/database");
const { initSocket } = require("./src/sockets");
const logger = require("./src/utils/logger");
const { startMedicationReminderJob } = require("./src/jobs/medicationReminder.job");

const PORT = process.env.PORT || 5000;

// ── Boot sequence ────────────────────────────────────────────────────────────
const bootstrap = async () => {
  try {
    // 1. Connect to MongoDB
    await connectDB();

    // 2. Create HTTP server
    const server = http.createServer(app);

    // 3. Attach Socket.IO
    initSocket(server);

    // 4. Start cron jobs
    startMedicationReminderJob();

    // 5. Start listening
    server.listen(PORT, () => {
      logger.info(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });

    // ── Graceful shutdown ──────────────────────────────────────────────────
    const shutdown = (signal) => {
      logger.warn(`${signal} received — shutting down gracefully`);
      server.close(() => {
        logger.info("HTTP server closed");
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT",  () => shutdown("SIGINT"));

  } catch (error) {
    logger.error(`Bootstrap failed: ${error.message}`);
    process.exit(1);
  }
};

// ── Unhandled rejections & exceptions ───────────────────────────────────────
process.on("unhandledRejection", (reason) => {
  logger.error(`Unhandled Rejection: ${reason}`);
  process.exit(1);
});

process.on("uncaughtException", (error) => {
  logger.error(`Uncaught Exception: ${error.message}`);
  process.exit(1);
});

bootstrap();
