"use strict";
const mongoose = require("mongoose");
const { SERVICE_CATEGORIES } = require("../constants");

const serviceSchema = new mongoose.Schema({
  serviceName:          { type: String, required: true, trim: true },
  description:          { type: String, required: true },
  duration:             { type: Number, required: true }, // hours
  price:                { type: Number, required: true },
  requiredQualification:{ type: String },
  category:             { type: String, enum: Object.values(SERVICE_CATEGORIES), required: true },
  isActive:             { type: Boolean, default: true },
  createdBy:            { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

serviceSchema.index({ category: 1, isActive: 1 });

module.exports = mongoose.model("Service", serviceSchema);
