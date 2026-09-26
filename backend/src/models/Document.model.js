"use strict";
const mongoose = require("mongoose");
const { DOCUMENT_TYPES } = require("../constants");

const documentSchema = new mongoose.Schema({
  ownerId:       { type: mongoose.Schema.Types.ObjectId, ref: "User",    required: true },
  patientId:     { type: mongoose.Schema.Types.ObjectId, ref: "Patient" },
  documentType:  { type: String, enum: Object.values(DOCUMENT_TYPES), required: true },
  title:         { type: String, required: true },
  fileUrl:       { type: String, required: true },
  publicId:      { type: String, required: true }, // Cloudinary public_id for deletion
  fileSize:      { type: Number },
  mimeType:      { type: String },
}, { timestamps: true });

documentSchema.index({ ownerId: 1, documentType: 1 });

module.exports = mongoose.model("Document", documentSchema);
