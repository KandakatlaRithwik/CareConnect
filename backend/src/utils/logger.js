"use strict";
const { createLogger, format, transports } = require("winston");
const path = require("path");
const { combine, timestamp, printf, colorize, errors } = format;

const logFormat = printf(({ level, message, timestamp: ts, stack }) =>
  `${ts} [${level}]: ${stack || message}`
);

const logger = createLogger({
  level: process.env.NODE_ENV === "production" ? "warn" : "debug",
  format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), errors({ stack: true }), logFormat),
  transports: [
    new transports.Console({
      format: combine(colorize({ all: true }), timestamp({ format: "HH:mm:ss" }), logFormat),
      silent: process.env.NODE_ENV === "test",
    }),
    new transports.File({ filename: path.join("logs", "error.log"),    level: "error", maxsize: 5242880,  maxFiles: 5  }),
    new transports.File({ filename: path.join("logs", "combined.log"),                 maxsize: 10485760, maxFiles: 10 }),
  ],
});

module.exports = logger;
