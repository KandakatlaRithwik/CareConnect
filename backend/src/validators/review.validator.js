"use strict";
const { body } = require("express-validator");

const reviewValidator = [
  body("bookingId").isMongoId().withMessage("Valid booking ID required"),
  body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
  body("review").optional().isLength({ max: 1000 }).withMessage("Review cannot exceed 1000 characters"),
];

module.exports = { reviewValidator };
