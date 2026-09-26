"use strict";
const mongoose = require("mongoose");

const careNoteSchema = new mongoose.Schema({
  bookingId:    { type: mongoose.Schema.Types.ObjectId, ref: "Booking",   required: true },
  caregiverId:  { type: mongoose.Schema.Types.ObjectId, ref: "Caregiver", required: true },
  patientId:    { type: mongoose.Schema.Types.ObjectId, ref: "Patient",   required: true },
  bloodPressure:{ type: String },
  sugarLevel:   { type: String },
  temperature:  { type: String },
  oxygenLevel:  { type: String },
  notes:        { type: String, required: true },
  recommendations:{ type: String },
  nextVisitDate:{ type: Date },
}, { timestamps: true });

careNoteSchema.index({ bookingId: 1 });
careNoteSchema.index({ patientId: 1, createdAt: -1 });

module.exports = mongoose.model("CareNote", careNoteSchema);
