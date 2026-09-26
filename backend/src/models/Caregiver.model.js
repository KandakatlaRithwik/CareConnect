"use strict";
const mongoose = require("mongoose");
const { CAREGIVER_TYPES, VERIFICATION_STATUS } = require("../constants");

const availabilitySchema = new mongoose.Schema({
  day:       { type: String, enum: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"] },
  startTime: { type: String },
  endTime:   { type: String },
  isAvailable:{ type: Boolean, default: true },
}, { _id: false });

const caregiverSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  caregiverType:{ type: String, enum: Object.values(CAREGIVER_TYPES), required: true },
  qualifications:   [{ type: String }],
  certifications:   [{ type: String }],
  experienceYears:  { type: Number, default: 0 },
  languages:        [{ type: String }],
  serviceAreas:     [{ type: String }],
  availabilitySchedule: [availabilitySchema],
  hourlyRate:       { type: Number, required: true },
  rating:           { type: Number, default: 0, min: 0, max: 5 },
  reviewsCount:     { type: Number, default: 0 },
  verificationStatus: { type: String, enum: Object.values(VERIFICATION_STATUS), default: VERIFICATION_STATUS.PENDING },
  governmentId:     { type: String }, // Cloudinary URL
  policeVerification:{ type: String }, // Cloudinary URL
  profileDescription:{ type: String, maxlength: 1000 },
  isAvailable:      { type: Boolean, default: true },
  totalEarnings:    { type: Number, default: 0 },
}, { timestamps: true });

caregiverSchema.index({ caregiverType: 1, verificationStatus: 1, isAvailable: 1 });
caregiverSchema.index({ rating: -1 });
caregiverSchema.index({ hourlyRate: 1 });

module.exports = mongoose.model("Caregiver", caregiverSchema);
