"use strict";
const mongoose = require("mongoose");
const { EMERGENCY_TYPES } = require("../constants");

const sosSchema = new mongoose.Schema({
  patientId:     { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  triggeredBy:   { type: mongoose.Schema.Types.ObjectId, ref: "User",    required: true },
  location: {
    latitude:  { type: Number },
    longitude: { type: Number },
    address:   { type: String },
  },
  emergencyType: { type: String, enum: Object.values(EMERGENCY_TYPES), required: true },
  status:        { type: String, enum: ["Active","Resolved"], default: "Active" },
  alertsSent: {
    family:    { type: Boolean, default: false },
    caregiver: { type: Boolean, default: false },
    admin:     { type: Boolean, default: false },
  },
  resolvedAt:    { type: Date },
  notes:         { type: String },
}, { timestamps: true });

sosSchema.index({ patientId: 1, status: 1 });

module.exports = mongoose.model("SOS", sosSchema);
