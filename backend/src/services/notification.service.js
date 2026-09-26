"use strict";
const Notification = require("../models/Notification.model");
const { NOTIFICATION_TYPES } = require("../constants");
const { getIO } = require("../sockets");

const createNotification = async ({ recipientId, title, message, type, refId, refModel }) => {
  const notification = await Notification.create({ recipientId, title, message, type, refId, refModel });
  // Push real-time event
  try {
    const io = getIO();
    io.to(`user:${recipientId}`).emit("notification", notification);
  } catch (_) { /* socket may not be available in tests */ }
  return notification;
};

const notifyBookingCreated = (recipientId, bookingId) =>
  createNotification({ recipientId, title: "New Booking Request", message: "You have a new booking request.", type: NOTIFICATION_TYPES.BOOKING_REQUEST, refId: bookingId, refModel: "Booking" });

const notifyBookingAccepted = (recipientId, bookingId) =>
  createNotification({ recipientId, title: "Booking Accepted", message: "Your booking has been accepted by the caregiver.", type: NOTIFICATION_TYPES.BOOKING_ACCEPTED, refId: bookingId, refModel: "Booking" });

const notifyBookingRejected = (recipientId, bookingId) =>
  createNotification({ recipientId, title: "Booking Rejected", message: "Your booking was rejected. Please try another caregiver.", type: NOTIFICATION_TYPES.BOOKING_REJECTED, refId: bookingId, refModel: "Booking" });

const notifyServiceCompleted = (recipientId, bookingId) =>
  createNotification({ recipientId, title: "Service Completed", message: "The care session has been marked as completed.", type: NOTIFICATION_TYPES.SERVICE_COMPLETED, refId: bookingId, refModel: "Booking" });

const notifyComplaintUpdated = (recipientId, complaintId) =>
  createNotification({ recipientId, title: "Complaint Updated", message: "Your complaint status has been updated.", type: NOTIFICATION_TYPES.COMPLAINT_UPDATE, refId: complaintId, refModel: "Complaint" });

module.exports = { createNotification, notifyBookingCreated, notifyBookingAccepted, notifyBookingRejected, notifyServiceCompleted, notifyComplaintUpdated };
