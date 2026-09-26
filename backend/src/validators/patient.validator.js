"use strict";
const { body } = require("express-validator");
const { BLOOD_GROUPS } = require("../constants");

const patientValidator = [
  body("patientName").trim().notEmpty().withMessage("Patient name is required"),
  body("age").isInt({ min: 0, max: 150 }).withMessage("Valid age required"),
  body("gender").isIn(["Male","Female","Other"]).withMessage("Invalid gender"),
  body("bloodGroup").optional().isIn(BLOOD_GROUPS).withMessage("Invalid blood group"),
  body("emergencyContact.name").notEmpty().withMessage("Emergency contact name is required"),
  body("emergencyContact.phone").notEmpty().withMessage("Emergency contact phone is required"),
];

module.exports = { patientValidator };
