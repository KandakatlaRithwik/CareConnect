"use strict";
const mongoose = require("mongoose");
const { BLOOD_GROUPS } = require("../constants");

const patientSchema = new mongoose.Schema({
  familyMemberId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  patientName:    { type: String, required: true, trim: true },
  age:            { type: Number, required: true, min: 0, max: 150 },
  gender:         { type: String, enum: ["Male","Female","Other"], required: true },
  bloodGroup:     { type: String, enum: BLOOD_GROUPS },
  height:         { type: Number }, // cm
  weight:         { type: Number }, // kg
  allergies:      [{ type: String, trim: true }],
  medicalConditions: [{ type: String, trim: true }],
  chronicDiseases:   [{ type: String, trim: true }],
  emergencyContact: {
    name:         { type: String, required: true },
    phone:        { type: String, required: true },
    relationship: { type: String },
  },
  medications: [{
    name:    { type: String },
    dosage:  { type: String },
    frequency:{ type: String },
  }],
  doctorName:    { type: String },
  doctorContact: { type: String },
  careRequirements: [{ type: String }],
  isActive:      { type: Boolean, default: true },
}, { timestamps: true });

patientSchema.index({ familyMemberId: 1 });

module.exports = mongoose.model("Patient", patientSchema);
