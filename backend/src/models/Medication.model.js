"use strict";
const mongoose = require("mongoose");
const { MEDICATION_FREQUENCY } = require("../constants");

const medicationSchema = new mongoose.Schema({
  patientId:     { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  familyMemberId:{ type: mongoose.Schema.Types.ObjectId, ref: "User",    required: true },
  medicineName:  { type: String, required: true, trim: true },
  dosage:        { type: String, required: true },
  frequency:     { type: String, enum: Object.values(MEDICATION_FREQUENCY), required: true },
  reminderTime:  [{ type: String }], // ["08:00", "20:00"]
  startDate:     { type: Date, default: Date.now },
  endDate:       { type: Date },
  isActive:      { type: Boolean, default: true },
  notes:         { type: String },
}, { timestamps: true });

medicationSchema.index({ patientId: 1, isActive: 1 });

module.exports = mongoose.model("Medication", medicationSchema);
