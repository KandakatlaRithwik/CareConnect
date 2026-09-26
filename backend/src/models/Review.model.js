"use strict";
const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  bookingId:   { type: mongoose.Schema.Types.ObjectId, ref: "Booking",   required: true, unique: true },
  caregiverId: { type: mongoose.Schema.Types.ObjectId, ref: "Caregiver", required: true },
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: "User",      required: true },
  rating:      { type: Number, required: true, min: 1, max: 5 },
  review:      { type: String, maxlength: 1000 },
}, { timestamps: true });

reviewSchema.index({ caregiverId: 1 });
reviewSchema.index({ userId: 1 });

module.exports = mongoose.model("Review", reviewSchema);
