"use strict";
const Booking    = require("../models/Booking.model");
const Caregiver  = require("../models/Caregiver.model");
const Patient    = require("../models/Patient.model");
const catchAsync = require("../utils/catchAsync");
const AppError   = require("../utils/AppError");
const { sendSuccess } = require("../utils/apiResponse");
const { BOOKING_STATUS, SOCKET_EVENTS } = require("../constants");
const { notifyBookingCreated, notifyBookingAccepted, notifyBookingRejected, notifyServiceCompleted } = require("../services/notification.service");
const { getIO } = require("../sockets");

// POST /api/v1/bookings
exports.createBooking = catchAsync(async (req, res, next) => {
  const { patientId, caregiverId, serviceId, bookingDate, startTime, endTime, bookingType } = req.body;

  const [patient, caregiver] = await Promise.all([
    Patient.findById(patientId),
    Caregiver.findById(caregiverId),
  ]);
  if (!patient)   return next(new AppError("Patient not found.", 404));
  if (!caregiver) return next(new AppError("Caregiver not found.", 404));
  if (!caregiver.isAvailable) return next(new AppError("Caregiver is not available.", 400));
  if (patient.familyMemberId.toString() !== req.user.id) return next(new AppError("This patient does not belong to you.", 403));

  const booking = await Booking.create({ patientId, caregiverId, serviceId, bookingDate, startTime, endTime, bookingType, familyMemberId: req.user.id });

  // Notify caregiver
  await notifyBookingCreated(caregiver.userId, booking._id);

  // Emit real-time event
  try { getIO().to(`user:${caregiver.userId}`).emit(SOCKET_EVENTS.BOOKING_CREATED, booking); } catch (_) {}

  return sendSuccess(res, 201, "Booking created successfully.", booking);
});

// GET /api/v1/bookings
exports.getBookings = catchAsync(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  let filter = {};

  if (req.user.role === "FamilyMember") filter.familyMemberId = req.user.id;
  if (req.user.role === "Caregiver") {
    const cg = await Caregiver.findOne({ userId: req.user.id });
    filter.caregiverId = cg?._id;
  }
  if (status) filter.status = status;

  const skip  = (parseInt(page) - 1) * parseInt(limit);
  const total = await Booking.countDocuments(filter);
  const bookings = await Booking.find(filter)
    .populate("patientId", "patientName age gender")
    .populate({ path: "caregiverId", populate: { path: "userId", select: "name email phone" } })
    .populate("serviceId", "serviceName category price")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  return sendSuccess(res, 200, "Bookings fetched.", bookings, { total, page: parseInt(page), pages: Math.ceil(total / limit) });
});

// GET /api/v1/bookings/:id
exports.getBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.params.id)
    .populate("patientId")
    .populate({ path: "caregiverId", populate: { path: "userId", select: "name email phone" } })
    .populate("serviceId");
  if (!booking) return next(new AppError("Booking not found.", 404));
  return sendSuccess(res, 200, "Booking fetched.", booking);
});

// PATCH /api/v1/bookings/status
exports.updateBookingStatus = catchAsync(async (req, res, next) => {
  const { bookingId, status, reason } = req.body;
  const booking = await Booking.findById(bookingId);
  if (!booking) return next(new AppError("Booking not found.", 404));

  const caregiver = await Caregiver.findById(booking.caregiverId);

  // Role-based status transitions
  if (req.user.role === "Caregiver") {
    if (caregiver?.userId.toString() !== req.user.id) return next(new AppError("Access denied.", 403));
    if (![BOOKING_STATUS.ACCEPTED, BOOKING_STATUS.REJECTED, BOOKING_STATUS.IN_PROGRESS, BOOKING_STATUS.COMPLETED].includes(status)) {
      return next(new AppError("Invalid status transition for caregiver.", 400));
    }
    if (status === BOOKING_STATUS.REJECTED) booking.rejectionReason = reason;
  }
  if (req.user.role === "FamilyMember") {
    if (booking.familyMemberId.toString() !== req.user.id) return next(new AppError("Access denied.", 403));
    if (status !== BOOKING_STATUS.CANCELLED) return next(new AppError("Family member can only cancel bookings.", 400));
    booking.cancellationReason = reason;
  }

  booking.status = status;
  await booking.save();

  // Notifications
  if (status === BOOKING_STATUS.ACCEPTED)  await notifyBookingAccepted(booking.familyMemberId, booking._id);
  if (status === BOOKING_STATUS.REJECTED)  await notifyBookingRejected(booking.familyMemberId, booking._id);
  if (status === BOOKING_STATUS.COMPLETED) await notifyServiceCompleted(booking.familyMemberId, booking._id);

  // Real-time emit
  try {
    const eventMap = {
      [BOOKING_STATUS.ACCEPTED]:  SOCKET_EVENTS.BOOKING_ACCEPTED,
      [BOOKING_STATUS.REJECTED]:  SOCKET_EVENTS.BOOKING_REJECTED,
      [BOOKING_STATUS.COMPLETED]: SOCKET_EVENTS.SERVICE_COMPLETED,
    };
    if (eventMap[status]) getIO().to(`booking:${bookingId}`).emit(eventMap[status], booking);
  } catch (_) {}

  return sendSuccess(res, 200, "Booking status updated.", booking);
});

// DELETE /api/v1/bookings/:id (Admin only)
exports.deleteBooking = catchAsync(async (req, res, next) => {
  const booking = await Booking.findByIdAndDelete(req.params.id);
  if (!booking) return next(new AppError("Booking not found.", 404));
  return sendSuccess(res, 200, "Booking deleted.");
});
