"use strict";
const mongoose = require("mongoose");
const { BOOKING_TYPES, BOOKING_STATUS } = require("../constants");

const bookingSchema = new mongoose.Schema({
  patientId:    { type: mongoose.Schema.Types.ObjectId, ref: "Patient",   required: true },
  caregiverId:  { type: mongoose.Schema.Types.ObjectId, ref: "Caregiver", required: true },
  serviceId:    { type: mongoose.Schema.Types.ObjectId, ref: "Service",   required: true },
  familyMemberId:{ type: mongoose.Schema.Types.ObjectId, ref: "User",    required: true },
  bookingDate:  { type: Date, required: true },
  startTime:    { type: String, required: true },
  endTime:      { type: String, required: true },
  bookingType:  { type: String, enum: Object.values(BOOKING_TYPES), required: true },
  status:       { type: String, enum: Object.values(BOOKING_STATUS), default: BOOKING_STATUS.PENDING },
  totalAmount:  { type: Number },
  notes:        { type: String },
  cancellationReason: { type: String },
  rejectionReason:    { type: String },
}, { timestamps: true });

bookingSchema.index({ patientId: 1 });
bookingSchema.index({ caregiverId: 1, status: 1 });
bookingSchema.index({ familyMemberId: 1 });
bookingSchema.index({ status: 1, bookingDate: 1 });

module.exports = mongoose.model("Booking", bookingSchema);
