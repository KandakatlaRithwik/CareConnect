"use strict";
const mongoose = require("mongoose");
const { NOTIFICATION_TYPES } = require("../constants");

const notificationSchema = new mongoose.Schema({
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title:       { type: String, required: true },
  message:     { type: String, required: true },
  type:        { type: String, enum: Object.values(NOTIFICATION_TYPES), required: true },
  isRead:      { type: Boolean, default: false },
  refId:       { type: mongoose.Schema.Types.ObjectId }, // related booking/complaint id
  refModel:    { type: String },
}, { timestamps: true });

notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
