"use strict";
const { body } = require("express-validator");
const { BOOKING_TYPES, BOOKING_STATUS } = require("../constants");

const bookingValidator = [
  body("patientId").isMongoId().withMessage("Valid patient ID required"),
  body("caregiverId").isMongoId().withMessage("Valid caregiver ID required"),
  body("serviceId").isMongoId().withMessage("Valid service ID required"),
  body("bookingDate").isISO8601().withMessage("Valid booking date required"),
  body("startTime").notEmpty().withMessage("Start time is required"),
  body("endTime").notEmpty().withMessage("End time is required"),
  body("bookingType").isIn(Object.values(BOOKING_TYPES)).withMessage("Invalid booking type"),
];

const bookingStatusValidator = [
  body("bookingId").isMongoId().withMessage("Valid booking ID required"),
  body("status").isIn(Object.values(BOOKING_STATUS)).withMessage("Invalid status"),
];

module.exports = { bookingValidator, bookingStatusValidator };
