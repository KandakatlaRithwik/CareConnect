"use strict";
const logger = require("../utils/logger");
const AppError = require("../utils/AppError");

const handleCastError       = (err) => new AppError(`Invalid ${err.path}: ${err.value}`, 400);
const handleDuplicateFields = (err) => new AppError(`Duplicate field value: ${Object.keys(err.keyValue).join(", ")} already exists`, 400);
const handleValidationError = (err) => new AppError(Object.values(err.errors).map(e => e.message).join(". "), 400);
const handleJWTError        = ()    => new AppError("Invalid token. Please login again.", 401);
const handleJWTExpiredError = ()    => new AppError("Token has expired. Please login again.", 401);

const errorHandler = (err, req, res, next) => {
  let error = { ...err, message: err.message };

  if (err.name === "CastError")              error = handleCastError(err);
  if (err.code === 11000)                    error = handleDuplicateFields(err);
  if (err.name === "ValidationError")        error = handleValidationError(err);
  if (err.name === "JsonWebTokenError")      error = handleJWTError();
  if (err.name === "TokenExpiredError")      error = handleJWTExpiredError();

  const statusCode = error.statusCode || 500;
  const message    = error.isOperational ? error.message : "Something went wrong. Please try again.";

  if (statusCode === 500) logger.error(`[${req.method}] ${req.originalUrl} — ${err.stack}`);

  return res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

const notFound = (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
};

module.exports = { errorHandler, notFound };
