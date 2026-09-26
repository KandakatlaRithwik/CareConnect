"use strict";
const mongoose = require("mongoose");
const { COMPLAINT_PRIORITY, COMPLAINT_STATUS } = require("../constants");

const complaintSchema = new mongoose.Schema({
  userId:      { type: mongoose.Schema.Types.ObjectId, ref: "User",    required: true },
  bookingId:   { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
  title:       { type: String, required: true, trim: true },
  description: { type: String, required: true },
  priority:    { type: String, enum: Object.values(COMPLAINT_PRIORITY), default: COMPLAINT_PRIORITY.MEDIUM },
  status:      { type: String, enum: Object.values(COMPLAINT_STATUS),   default: COMPLAINT_STATUS.OPEN },
  adminResponse:{ type: String },
  resolvedAt:  { type: Date },
}, { timestamps: true });

complaintSchema.index({ userId: 1, status: 1 });
complaintSchema.index({ status: 1, priority: -1 });

module.exports = mongoose.model("Complaint", complaintSchema);
